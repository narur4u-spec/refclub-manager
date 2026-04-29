import Map "mo:core/Map";
import MemberLib "../lib/members";
import ReferralLib "../lib/referrals";
import MemberTypes "../types/members";
import Common "../types/common";

mixin (memberState : MemberLib.State, referralState : ReferralLib.State) {

  public type LeaderboardEntry = {
    memberId : Common.MemberId;
    memberName : Text;
    businessName : Text;
    chapterId : Common.ChapterId;
    referralCount : Nat;
  };

  public query func getLeaderboard(chapterId : ?Common.ChapterId) : async [LeaderboardEntry] {
    // Build a map of memberId -> count
    let counts = Map.empty<Common.MemberId, Nat>();
    referralState.referrals.forEach(func(r) {
      let current = switch (counts.get(r.giverId)) {
        case (?n) n;
        case null 0;
      };
      counts.add(r.giverId, current + 1);
    });

    // Build leaderboard entries for matching members
    let members : [MemberTypes.Member] = switch (chapterId) {
      case (?cid) MemberLib.listMembersByChapter(memberState, cid);
      case null MemberLib.listMembers(memberState);
    };

    let entries = members.map(
      func(m) {
        let count = switch (counts.get(m.id)) {
          case (?n) n;
          case null 0;
        };
        {
          memberId = m.id;
          memberName = m.name;
          businessName = m.businessName;
          chapterId = m.chapterId;
          referralCount = count;
        };
      },
    );

    // Sort: count descending, then name ascending
    entries.sort(
      func(a, b) {
        if (a.referralCount > b.referralCount) { #less }
        else if (a.referralCount < b.referralCount) { #greater }
        else { a.memberName.compare(b.memberName) };
      },
    );
  };

};
