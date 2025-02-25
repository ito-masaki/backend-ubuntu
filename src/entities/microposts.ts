import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  @Entity()
  export class MicroPost {
    @PrimaryGeneratedColumn()
    readonly id: number;
  
    @Column()
    user_id: number;
  
    @Column('varchar')
    content: string;
  
    @CreateDateColumn()
    readonly created_at?: Date;
  
    @UpdateDateColumn()
    readonly updated_at?: Date;
  }
  