import { MODEPLAY, STATES } from 'src/constants';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('r_list_member_ships')
export class listMembership extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  r_id: number;

  @Column({ type: 'int' })
  r_id_video: number;

  @Column({ type: 'int' })
  r_id_company: number;

  @Column({ type: 'int' })
  r_id_user: number;

  @Column({ type: 'enum', enum: MODEPLAY })
  r_order: MODEPLAY;

  @Column({ type: 'time' })
  r_count_Skin: string;

  @Column({ type: 'enum', enum: STATES })
  r_state: STATES;

  @Column({ type: 'varchar' })
  r_title: string;

  @Column({ type: 'varchar' })
  r_description: string;

  @Column({ type: 'varchar' })
  r_thumbnails_Default: string;

  @Column({ type: 'varchar' })
  r_thumbnails_Medium: string;

  @Column({ type: 'varchar' })
  r_thumbnails_High: string;

  @Column({ type: 'boolean' })
  r_full_screen: boolean;
}
