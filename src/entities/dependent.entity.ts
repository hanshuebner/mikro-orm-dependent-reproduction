import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/sqlite';
import { User } from './user.entity';

@Entity()
export class Dependent {

  @PrimaryKey()
  id!: number;

  @Property()
  name: string;

  @ManyToOne(() => User)
  user: User;

  constructor(name: string, user: User) {
    this.name = name;
    this.user = user;
  }
} 