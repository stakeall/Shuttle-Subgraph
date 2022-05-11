import { BigInt } from "@graphprotocol/graph-ts"
import {
  RootPool,
  ShuttleProcessed,
  ShuttleProcessingInitiated
} from "../generated/RootPool/RootPool"
import { Shuttle, ShuttleLifecycleEvent } from "../generated/schema"

export function handleShuttleProcessed(event: ShuttleProcessed): void {
  const shuttleId = event.params._shuttleNumber.toString();
  const shuttleStatus = event.params._processingStatus === 0 ? "Processed" : "Cancelled";
  const shuttleLifecycleId = `${shuttleId}-${shuttleStatus}`;

  let shuttleEntity = Shuttle.load(shuttleId);

  if (!shuttleEntity) {
    shuttleEntity = new Shuttle(shuttleId);
  }

  shuttleEntity.amount = event.params._stakeAmount;
  shuttleEntity.receivedAmount = event.params._stMaticAmount;
  shuttleEntity.shuttleNumber = event.params._shuttleNumber;
  shuttleEntity.status = shuttleStatus;

  let shuttleLifecycleEventEntity = new ShuttleLifecycleEvent(shuttleLifecycleId);
  shuttleLifecycleEventEntity.createdAt = event.block.timestamp.toI32();
  shuttleLifecycleEventEntity.createdAtBlock = event.block.number.toI32();
  shuttleLifecycleEventEntity.status = shuttleStatus;
  shuttleLifecycleEventEntity.shuttle = shuttleId;
  shuttleLifecycleEventEntity.txHash = event.transaction.hash;

  shuttleEntity.save();
  shuttleLifecycleEventEntity.save();

}

export function handleShuttleProcessingInitiated(event: ShuttleProcessingInitiated): void {
  let shuttleId = event.params._shuttleNumber.toString();
  const shuttleStatus = "Initiated";
  let shuttleLifecycleId = `${shuttleId}-${shuttleStatus}`;

  let shuttleEntity = Shuttle.load(shuttleId);

  if (!shuttleEntity) {
    shuttleEntity = new Shuttle(shuttleId);
  }

  shuttleEntity.status = "Initiated";
  shuttleEntity.shuttleNumber = event.params._shuttleNumber;

  let shuttleLifecycleEventEntity = new ShuttleLifecycleEvent(shuttleLifecycleId);
  shuttleLifecycleEventEntity.createdAt = event.block.timestamp.toI32();
  shuttleLifecycleEventEntity.createdAtBlock = event.block.number.toI32();
  shuttleLifecycleEventEntity.status = shuttleStatus;
  shuttleLifecycleEventEntity.shuttle = shuttleId;
  shuttleLifecycleEventEntity.txHash = event.transaction.hash;

  shuttleEntity.save();
  shuttleLifecycleEventEntity.save();
}