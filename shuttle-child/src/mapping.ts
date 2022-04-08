import { BigInt, Entity } from "@graphprotocol/graph-ts"
import {
  ChildPool,
  Deposit,
  ShuttleArrived,
  ShuttleCancelled,
  ShuttleCreated,
  ShuttleExpired,
  ShuttleEnrouted,
  TokenClaimed,
} from "../generated/ChildPool/ChildPool"
import { Shuttle, ShuttleLifecyleEvent, ShuttleUser, User } from "../generated/schema"

export function handleDeposit(event: Deposit): void {
  const userId = event.params._sender.toHexString();
  const shuttleId = event.params._shuttlesNumber.toString();
  const shuttleUserId = `${userId}-${shuttleId}`;

  let shuttleUserEntity = ShuttleUser.load(shuttleUserId);

  if (!shuttleUserEntity) {
    shuttleUserEntity = new ShuttleUser(shuttleUserId);
    shuttleUserEntity.user = userId;
    shuttleUserEntity.position = "Deposited";
    shuttleUserEntity.shuttle = event.params._shuttlesNumber.toString();
  }

  shuttleUserEntity.amount = shuttleUserEntity.amount.plus(event.params._amount);
  shuttleUserEntity.depositedAt = event.block.timestamp.toI32();

  let userEntity = User.load(userId);

  if (!userEntity) {
    userEntity = new User(userId);
  }

  let shuttleEntity = Shuttle.load(shuttleId)!;
  shuttleEntity.amount = shuttleEntity.amount.plus(event.params._amount);
  
  shuttleUserEntity.save();
  userEntity.save();
  shuttleEntity.save();
}

export function handleTokenClaimed(event: TokenClaimed): void {
  const userId = event.params._beneficiary.toHexString();
  const shuttleId = event.params._shuttleNumber.toString();
  const shuttleUserId = `${userId}-${shuttleId}`;

  let shuttleUserEntity = ShuttleUser.load(shuttleUserId)!;

  shuttleUserEntity.position = "Claimed";
  shuttleUserEntity.claimedAmount = event.params._claimedAmount;
  shuttleUserEntity.claimedAt = event.block.timestamp.toI32();
 
  shuttleUserEntity.save();
}

export function handleShuttleCreated(event: ShuttleCreated): void {
  const shuttleId = event.params._shuttleNumber.toString();
  const shuttleStatus = "Available";
  const shuttleLifecyleId = `${shuttleId}-${shuttleStatus}`;

  let shuttleEntity = new Shuttle(shuttleId);
  shuttleEntity.status = shuttleStatus;
  shuttleEntity.amount = BigInt.fromI32(0);
  shuttleEntity.receivedAmount = BigInt.fromI32(0);
  shuttleEntity.fee = BigInt.fromI32(0);
  shuttleEntity.shuttleNumber = event.params._shuttleNumber;
  
  let childPoolContract = ChildPool.bind(event.address);
  shuttleEntity.expiry = childPoolContract.shuttles(event.params._shuttleNumber).value3;
  
  let shuttleLifecycleEventEntity = new ShuttleLifecyleEvent(shuttleLifecyleId);
  shuttleLifecycleEventEntity.createdAt = event.block.timestamp.toI32();
  shuttleLifecycleEventEntity.createdAtBlock = event.block.number.toI32();
  shuttleLifecycleEventEntity.status = shuttleStatus;
  shuttleLifecycleEventEntity.shuttle = shuttleId;
  shuttleLifecycleEventEntity.txHash = event.transaction.hash;

  shuttleEntity.save();
  shuttleLifecycleEventEntity.save();
}

export function handleShuttleEnrouted(event: ShuttleEnrouted): void {
  const shuttleId = event.params._shuttleNumber.toString();
  const shuttleStatus = "Enroute";
  const shuttleLifecyleId = `${shuttleId}-${shuttleStatus}`;

  let shuttleEntity = Shuttle.load(shuttleId)!;
  shuttleEntity.status = shuttleStatus;
  
  let shuttleLifecyleEventEntity = new ShuttleLifecyleEvent(shuttleLifecyleId);
  shuttleLifecyleEventEntity.status = shuttleStatus;
  shuttleLifecyleEventEntity.createdAt = event.block.timestamp.toI32();
  shuttleLifecyleEventEntity.createdAtBlock = event.block.number.toI32();
  shuttleLifecyleEventEntity.shuttle = shuttleId;
  shuttleLifecyleEventEntity.txHash = event.transaction.hash;
  
  shuttleEntity.save();
  shuttleLifecyleEventEntity.save();
}

export function handleShuttleArrived(event: ShuttleArrived): void {
  const shuttleId = event.params._shuttleNumber.toString();

  let shuttleEntity = Shuttle.load(shuttleId)!;

  if (event.params._status === 4) {
    shuttleEntity.status = "Cancelled";
  }

  if (event.params._status === 2) {
    shuttleEntity.status = "Arrived";
    shuttleEntity.receivedAmount = event.params._amount;
    shuttleEntity.fee = event.params._shuttleFee;
  }
  
  const shuttleLifecycleId = `${shuttleId}-${shuttleEntity.status}`;
  let shuttleLifecyleEventEntity = new ShuttleLifecyleEvent(shuttleLifecycleId);
  shuttleLifecyleEventEntity.status = shuttleEntity.status;
  shuttleLifecyleEventEntity.createdAt = event.block.timestamp.toI32();
  shuttleLifecyleEventEntity.createdAtBlock = event.block.number.toI32();
  shuttleLifecyleEventEntity.shuttle = shuttleId;
  shuttleLifecyleEventEntity.txHash = event.transaction.hash;

  shuttleEntity.save();
  shuttleLifecyleEventEntity.save();
}

export function handleShuttleExpired(event: ShuttleExpired): void {
  const shuttleId = event.params._shuttleNumber.toString();
  const shuttleStatus = "Expired";
  const shuttleLifecyleId = `${shuttleId}-${shuttleStatus}`;

  let shuttleEntity = Shuttle.load(shuttleId)!;
  shuttleEntity.status = shuttleStatus;

  let shuttleLifecyleEventEntity = new ShuttleLifecyleEvent(shuttleLifecyleId);
  shuttleLifecyleEventEntity.status = shuttleStatus;
  shuttleLifecyleEventEntity.createdAt = event.block.timestamp.toI32();
  shuttleLifecyleEventEntity.createdAtBlock = event.block.number.toI32();
  shuttleLifecyleEventEntity.shuttle = shuttleId;
  shuttleLifecyleEventEntity.txHash = event.transaction.hash;

  shuttleEntity.save();
  shuttleLifecyleEventEntity.save();
}

export function handleShuttleCancelled(event: ShuttleCancelled): void {
  const id = event.params._shuttleNumber.toString();
  const shuttleStatus = "Cancelled";
  const shuttleLifecycleId = `${id}-${shuttleStatus}`;

  let shuttle = Shuttle.load(id)!;
  shuttle.status = shuttleStatus;

  let shuttleLifecyleEntity = new ShuttleLifecyleEvent(shuttleLifecycleId);
  shuttleLifecyleEntity.status = shuttleStatus;
  shuttleLifecyleEntity.createdAt = event.block.timestamp.toI32();
  shuttleLifecyleEntity.createdAtBlock = event.block.number.toI32();
  shuttleLifecyleEntity.shuttle = id;
  shuttleLifecyleEntity.txHash = event.transaction.hash;

  shuttle.save();
  shuttleLifecyleEntity.save();
} 