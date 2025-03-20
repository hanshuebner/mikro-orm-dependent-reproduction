import {Collection, Entity, OneToMany, PrimaryKey, Property, BeforeCreate, Cascade, EventArgs} from '@mikro-orm/sqlite';
import {Dependent} from './dependent.entity';

@Entity()
export class User {

    @PrimaryKey()
    id!: number;

    @Property()
    name: string;

    @Property({unique: true})
    email: string;

    @OneToMany(() => Dependent, dependent => dependent.user, {cascade: [Cascade.PERSIST]})
    dependents = new Collection<Dependent>(this);

    constructor(name: string, email: string) {
        this.name = name;
        this.email = email;
    }

    @BeforeCreate()
    createDependents({em}: EventArgs<Dependent>) {
        // Create between 1-5 dependents
        const count = Math.floor(Math.random() * 5) + 1;

        for (let i = 0; i < count; i++) {
            const dependent = em.create(Dependent, {
                user: this,
                name: `Dependent ${i + 1} of ${this.name}`
            })
            this.dependents.add(dependent);
        }
    }
}
