import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Project as IProject } from "@repo/shared";

/**
 * @title Project Entity
 * @notice TypeORM entity representing a project with sale and vesting information
 * @dev Implements the IProject interface from shared repository
 */
@Entity("projects")
export class Project implements IProject {
  /**
   * @notice Unique identifier for the project
   * @dev Auto-generated primary key
   */
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * @notice Start time of the token sale
   * @dev Stored as timestamp in the database
   */
  @Column({ type: "timestamp", name: "sale_start" })
  saleStart!: Date;

  /**
   * @notice End time of the token sale
   * @dev Stored as timestamp in the database
   */
  @Column({ type: "timestamp", name: "sale_end" })
  saleEnd!: Date;

  /**
   * @notice Time when registration period ends
   * @dev Stored as timestamp in the database
   */
  @Column({ type: "timestamp", name: "registration_time_ends" })
  registrationTimeEnds!: Date;

  /**
   * @notice Time when registration period starts
   * @dev Stored as timestamp in the database
   */
  @Column({ type: "timestamp", name: "registration_time_starts" })
  registrationTimeStarts!: Date;

  /**
   * @notice Timestamp when the project record was created
   * @dev Automatically set by TypeORM on entity creation
   */
  @CreateDateColumn({ name: "create_time" })
  createTime!: Date;

  /**
   * @notice Timestamp when the project record was last updated
   * @dev Automatically updated by TypeORM on entity modification
   */
  @UpdateDateColumn({ name: "update_time" })
  updateTime!: Date;

  /**
   * @notice Token Generation Event (TGE) timestamp
   * @dev When tokens are initially distributed
   */
  @Column({ type: "timestamp" })
  tge!: Date;

  /**
   * @notice Time when tokens become unlocked
   * @dev Initial unlock time for vesting schedule
   */
  @Column({ type: "timestamp", name: "unlock_time" })
  unlockTime!: Date;

  /**
   * @notice Private field storing vesting unlock times as JSON string
   * @dev Used internally for database storage, accessed via getter/setter
   */
  @Column({ type: "text", name: "vesting_portions_unlock_time" })
  private _vestingPortionsUnlockTime!: string;

  /**
   * @notice Private field storing vesting percentages as JSON string
   * @dev Used internally for database storage, accessed via getter/setter
   */
  @Column({ type: "text", name: "vesting_percent_per_portion" })
  private _vestingPercentPerPortion!: string;

  /**
   * @notice Gets the vesting portions unlock times as an array
   * @dev Parses JSON string from database into number array
   * @return Array of unlock times for each vesting portion
   */
  get vestingPortionsUnlockTime(): number[] {
    try {
      return JSON.parse(this._vestingPortionsUnlockTime || "[]");
    } catch {
      return [];
    }
  }

  /**
   * @notice Sets the vesting portions unlock times
   * @dev Converts number array to JSON string for database storage
   * @param value Array of unlock times for each vesting portion
   */
  set vestingPortionsUnlockTime(value: number[]) {
    this._vestingPortionsUnlockTime = JSON.stringify(value);
  }

  /**
   * @notice Gets the vesting percentages per portion as an array
   * @dev Parses JSON string from database into number array
   * @return Array of percentages for each vesting portion
   */
  get vestingPercentPerPortion(): number[] {
    try {
      return JSON.parse(this._vestingPercentPerPortion || "[]");
    } catch {
      return [];
    }
  }

  /**
   * @notice Sets the vesting percentages per portion
   * @dev Converts number array to JSON string for database storage
   * @param value Array of percentages for each vesting portion
   */
  set vestingPercentPerPortion(value: number[]) {
    this._vestingPercentPerPortion = JSON.stringify(value);
  }
}
