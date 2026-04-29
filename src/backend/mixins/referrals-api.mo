import ReferralLib "../lib/referrals";
import ReferralTypes "../types/referrals";
import Common "../types/common";

mixin (state : ReferralLib.State) {

  public shared func addReferral(
    giverId : Common.MemberId,
    receiverId : Common.MemberId,
    businessCategory : Text,
    dealStatus : ReferralTypes.DealStatus,
    dealValue : ?Nat,
    notes : Text,
  ) : async ReferralTypes.Referral {
    ReferralLib.addReferral(state, giverId, receiverId, businessCategory, dealStatus, dealValue, notes);
  };

  public shared func updateReferral(
    id : Common.ReferralId,
    businessCategory : Text,
    dealStatus : ReferralTypes.DealStatus,
    dealValue : ?Nat,
    notes : Text,
  ) : async ?ReferralTypes.Referral {
    ReferralLib.updateReferral(state, id, businessCategory, dealStatus, dealValue, notes);
  };

  public shared func deleteReferral(id : Common.ReferralId) : async Bool {
    ReferralLib.deleteReferral(state, id);
  };

  public query func getReferralsByGiver(giverId : Common.MemberId) : async [ReferralTypes.Referral] {
    ReferralLib.getReferralsByGiver(state, giverId);
  };

  public query func getReferralsByReceiver(receiverId : Common.MemberId) : async [ReferralTypes.Referral] {
    ReferralLib.getReferralsByReceiver(state, receiverId);
  };

  public query func getAllReferrals() : async [ReferralTypes.Referral] {
    ReferralLib.getAllReferrals(state);
  };

};
