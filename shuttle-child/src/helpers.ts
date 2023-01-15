import { CampaignMeta, ShuttleStat } from "../generated/schema";

const ID = "1";

export function createOrLoadShuttleStat(): ShuttleStat {
    let shuttleStat = ShuttleStat.load(ID);

    if (shuttleStat === null){
        shuttleStat = new ShuttleStat(ID);
    }

    return shuttleStat;
}

export function createOrLoadCampaignMeta(): CampaignMeta {
    let campaignMeta = CampaignMeta.load(ID);

    if (campaignMeta === null) {
        campaignMeta = new CampaignMeta(ID);
    }

    return campaignMeta;
}