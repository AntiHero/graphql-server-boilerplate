import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import * as bcrypt from "bcryptjs";
// import { v4 as uuidv4 } from "uuid";
// import { uuid } from 'uuidv4';

@Entity("users")
export class User extends BaseEntity {
  // problem with uuid function while testing is solved with the help of adding extention to db CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar", { length: 255, nullable: true })
  email: string | null;

  @Column("text", { nullable: true })
  password: string | null;

  @Column("boolean", { default: false })
  confirmed: boolean;

  @Column("boolean", { default: false })
  restorePasswordLocked: boolean;

  @Column("text", { nullable: true })
  googleId: string | null;

  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
  // @BeforeInsert()
  // addId() {
  //   this.id = uuidv4();
  // }
}
