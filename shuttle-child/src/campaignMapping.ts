import {
  CampaignCreated,
  RewardClaimed,
  CampaignStatusModified,
} from "../generated/Campaign/Campaign";

import { Campaign, CampaignUser, Shuttle } from "../generated/schema";

export function handleCampaignCreated(event: CampaignCreated): void {
  let campaignEntity = new Campaign(event.params.campaignNumber.toString());

  campaignEntity.status = "Active";
  campaignEntity.endShuttle = event.params.endShuttle.toI32();
  campaignEntity.startShuttle = event.params.startShuttle.toI32();

  campaignEntity.campaignNumber = event.params.campaignNumber.toI32();

  campaignEntity.rewardToken = event.params.rewardToken;
  campaignEntity.rewardAmount = event.params.totalRewardAmount;
  campaignEntity.rewardAmountPerShuttle = event.params.rewardAmountPerShuttle;

  campaignEntity.createdAt = event.block.timestamp.toI32();
  campaignEntity.createdAtBlock = event.block.number.toI32();

  campaignEntity.save();
}

export function handleCampaignStatusModified(
  event: CampaignStatusModified
): void {
  let campaignEntity = Campaign.load(event.params.campaignNumber.toString())!;

  if (event.params.campaignStatus === 0) {
    campaignEntity.status = "Active";
  }

  if (event.params.campaignStatus === 1) {
    campaignEntity.status = "Paused";
  }

  if (event.params.campaignStatus === 2) {
    campaignEntity.status = "Deleted";
  }

  campaignEntity.save();
}

export function handleRewardClaimed(event: RewardClaimed): void {
  let campaignEntity = Campaign.load(event.params.campaignNumber.toString())!;

  campaignEntity.claimedAmount = campaignEntity.claimedAmount.plus(
    event.params.rewardAmount
  );

  const campaignUserEntityId = `${event.params.sender.toHexString()}-${event.params.shuttleNumber.toString()}-${event.params.campaignNumber.toString()}`;
  let campaignUserEntity = CampaignUser.load(campaignUserEntityId);

  if (!campaignUserEntity) {
    campaignUserEntity = new CampaignUser(campaignUserEntityId);
  }

  campaignUserEntity.claimed = true;
  campaignUserEntity.campaign = event.params.campaignNumber.toString();
  campaignUserEntity.claimedAt = event.block.timestamp.toI32();
  campaignUserEntity.claimedRewardAmount = event.params.rewardAmount;

  const shuttleUserEntityId = `${event.params.sender.toHexString()}-${event.params.shuttleNumber.toString()}`;
  campaignUserEntity.user = shuttleUserEntityId;

  let shuttleEntity = Shuttle.load(event.params.shuttleNumber.toString())!;
  shuttleEntity.campaign = event.params.campaignNumber.toString();

  campaignEntity.save();
  campaignUserEntity.save();
  shuttleEntity.save();
}
