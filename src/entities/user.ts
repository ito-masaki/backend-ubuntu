import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column('varchar')
  name: string;

  @Column(`varchar`, { length: 200, nullable: true })
  introduction: string;

  @Column('varchar')
  hash: string;

  @Column('varchar')
  email: string;

  @Column({
    type: `enum`,
    enum: Gender,
    default: Gender.OTHER,
  })
  Gender: Gender;

  @CreateDateColumn()
  readonly created_at?: Date;

  @UpdateDateColumn()
  readonly updated_at?: Date;
}
