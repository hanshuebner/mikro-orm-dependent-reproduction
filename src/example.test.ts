import { MikroORM } from '@mikro-orm/sqlite';
import { User, Dependent } from './entities';

let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({
    dbName: ':memory:',
    entities: [User, Dependent],
    debug: ['query', 'query-params'],
    allowGlobalContext: true, // only for testing
  });
  await orm.schema.refreshDatabase();
});

afterAll(async () => {
  await orm.close(true);
});

test('basic CRUD example with dependents', async () => {
  // Create user which will automatically create 1-5 dependents via hook
  orm.em.create(User, { name: 'Foo', email: 'foo' });
  await orm.em.flush();
  orm.em.clear();

  // Verify user was created
  const user = await orm.em.findOneOrFail(User, { email: 'foo' }, { populate: ['dependents'] });
  expect(user.name).toBe('Foo');
  expect(user.dependents.length).toBeGreaterThanOrEqual(1);
  expect(user.dependents.length).toBeLessThanOrEqual(5);
  
  // Verify dependents were created with correct data
  const firstDependent = user.dependents[0];
  expect(firstDependent.name).toContain('Dependent');
  expect(firstDependent.name).toContain('Foo');
  
  // Test update and delete
  user.name = 'Bar';
  orm.em.remove(user);
  await orm.em.flush();

  // Verify user was deleted
  const userCount = await orm.em.count(User, { email: 'foo' });
  expect(userCount).toBe(0);
  
  // Verify dependents were also deleted
  const dependentCount = await orm.em.count(Dependent, {});
  expect(dependentCount).toBe(0);
});
