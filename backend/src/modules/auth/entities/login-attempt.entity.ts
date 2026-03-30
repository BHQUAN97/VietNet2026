import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('login_attempts')
export class LoginAttempt {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ type: 'varchar', length: 45 })
  ip_address!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'tinyint', width: 1 })
  success!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  attempted_at!: Date;
}
