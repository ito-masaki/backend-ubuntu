import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column('varchar')
  name: string;

  @Column('varchar')
  hash: string;

  @Column('varchar')
  email: string;

  @CreateDateColumn()
  readonly created_at?: Date;

  @UpdateDateColumn()
  readonly updated_at?: Date;
}
