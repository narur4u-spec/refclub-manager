import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/referrals";
import Common "../types/common";

module {
  public type State = {
    referrals : List.List<Types.Referral>;
    var nextReferralId : Common.ReferralId;
  };

  public func addReferral(
    state : State,
    giverId : Common.MemberId,
    receiverId : Common.MemberId,
    businessCategory : Text,
    dealStatus : Types.DealStatus,
    dealValue : ?Nat,
    notes : Text,
  ) : Types.Referral {
    let referral : Types.Referral = {
      id = state.nextReferralId;
      giverId;
      receiverId;
      businessCategory;
      dealStatus;
      dealValue;
      notes;
      createdAt = Time.now();
    };
    state.referrals.add(referral);
    state.nextReferralId += 1;
    referral;
  };

  public func updateReferral(
    state : State,
    id : Common.ReferralId,
    businessCategory : Text,
    dealStatus : Types.DealStatus,
    dealValue : ?Nat,
    notes : Text,
  ) : ?Types.Referral {
    var updated : ?Types.Referral = null;
    state.referrals.mapInPlace(
      func(r) {
        if (r.id == id) {
          let u : Types.Referral = { r with businessCategory; dealStatus; dealValue; notes };
          updated := ?u;
          u;
        } else { r };
      }
    );
    updated;
  };

  public func deleteReferral(state : State, id : Common.ReferralId) : Bool {
    let before = state.referrals.size();
    let filtered = state.referrals.filter(func(r) { r.id != id });
    if (filtered.size() < before) {
      state.referrals.clear();
      state.referrals.append(filtered);
      true;
    } else {
      false;
    };
  };

  public func getReferralsByGiver(state : State, giverId : Common.MemberId) : [Types.Referral] {
    state.referrals.filter(func(r) { r.giverId == giverId }).toArray();
  };

  public func getReferralsByReceiver(state : State, receiverId : Common.MemberId) : [Types.Referral] {
    state.referrals.filter(func(r) { r.receiverId == receiverId }).toArray();
  };

  public func getAllReferrals(state : State) : [Types.Referral] {
    state.referrals.toArray();
  };
};
