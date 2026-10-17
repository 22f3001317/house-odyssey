#!/bin/bash
. "$(dirname "$0")/lib.sh"
ROOT_DIR="${ROOT:-$(pwd)}"
startdev 3190 ADMIN_EMAILS=boss@uni.edu
un() { sed 's/\\"/"/g;s/<!-- -->//g;s/&quot;/"/g'; }
ids() { un | grep -o "\"type\":\"$1\",\"id\":\"[0-9a-f-]\{36\}\"" | grep -o '[0-9a-f-]\{36\}' | awk '!s[$0]++'; }
uid() { get $1 /leaderboard | un | grep -o "members/[0-9a-f-]\{36\}\">$2<" | head -1 | grep -o '[0-9a-f-]\{36\}'; }
BOSS=/tmp/boss8; BEN=/tmp/ben8; ASHA=/tmp/asha8; CY=/tmp/cy8; DEV=/tmp/dev8; DAN=/tmp/dan8; rm -f $BOSS $BEN $ASHA $CY $DEV $DAN
act() { post $1 /api/admin/action "$2"; }
reg Boss boss@uni.edu $BOSS 1; reg Ben ben@uni.edu $BEN 1
BENID=$(get $BOSS /dashboard | ids role | head -1); act $BOSS "{\"type\":\"role\",\"id\":\"$BENID\",\"role\":\"council\"}" >/dev/null
reg Asha asha@uni.edu $ASHA 1; reg Cy cy@uni.edu $CY 1; reg Dev dev@uni.edu $DEV 1; reg Dan dan@uni.edu $DAN 0
ASHAID=$(uid $BOSS Asha); CYID=$(uid $BOSS Cy); DEVID=$(uid $BOSS Dev)
echo "== A. ROLE-BASED /dashboard =="
D=$(get $BOSS /dashboard | un); echo "1 admin sees: $(echo "$D" | grep -o 'Admin dashboard\|>Analytics<\|>Members<\|My dashboard' | sort -u | tr '\n' ';')"
D=$(get $BEN /dashboard | un); echo "2 council sees: $(echo "$D" | grep -o 'Council dashboard\|Moderation\|>Analytics<\|>Members<\|My dashboard' | sort -u | tr '\n' ';')  (no Analytics/Members expected)"
D=$(get $ASHA /dashboard | un); echo "3 student sees student dashboard: $(echo "$D" | grep -c 'Hi, Asha')  admin/council/queues (expect 0): $(echo "$D" | grep -c 'Admin dashboard\|Council dashboard\|Quest approvals')"
echo "4 student/council forcing admin tabs: student=$(get $ASHA '/dashboard?tab=analytics' | un | grep -c 'Active members per day') council=$(get $BEN '/dashboard?tab=analytics' | un | grep -c 'Active members per day') members-tab council=$(get $BEN '/dashboard?tab=members' | un | grep -c 'Download CSV') (all expect 0)  | admin=$(get $BOSS '/dashboard?tab=analytics' | un | grep -c 'Active members per day') (expect >0)"
echo "5 old admin URLs redirect: $(for p in /admin /admin/analytics /admin/users; do curl -s -o /dev/null -w '%{http_code}>%{redirect_url} ' -b $BOSS $B$p; done)"
echo "6 anon /dashboard: $(curl -s -o /dev/null -w '%{http_code}>%{redirect_url}' $B/dashboard)  unverified Dan: $(get $DAN /dashboard | un | grep -o 'organizer will verify' | head -1)"
echo "7 admin-only API still blocked: student export=$(code $ASHA /api/admin/export) council export=$(code $BEN /api/admin/export) admin export=$(code $BOSS /api/admin/export)  student action=$(act $ASHA '{"type":"announcement","id":"00000000-0000-4000-8000-000000000000"}' | cut -c1-60)"
echo "== B. PROFILE =="
P='{"name":"Asha K","avatar":"fox","house":"gir","bio":"Loves <script>alert(1)</script> robotics","skills":["Rust","Guitar"],"interests":["Programming","Gaming"],"visibility":["bio","interests","badges","featured"],"featured":""}'
echo "8 save profile: $(post $ASHA /api/profile "$P")"
echo "9 validation: bad avatar=$(post $ASHA /api/profile "${P/fox/dragon}" | cut -c1-40) | long bio=$(post $ASHA /api/profile "${P/Loves/$(printf 'x%.0s' {1..300})}" | cut -c1-50) | bad interest=$(post $ASHA /api/profile "${P/Gaming/Hacking}" | cut -c1-40) | 9 skills=$(post $ASHA /api/profile "${P/\"Rust\",\"Guitar\"/\"a\",\"b\",\"c\",\"d\",\"e\",\"f\",\"g\",\"h\",\"i\"}" | cut -c1-45)"
echo "10 featured others/fake rejected: $(post $ASHA /api/profile "${P/\"featured\":\"\"/\"featured\":\"post:00000000-0000-4000-8000-000000000000\"}")"
V=$(get $BEN /members/$ASHAID | un)
echo "11 member view: name=$(echo "$V" | grep -c 'Asha K') bio=$(echo "$V" | grep -c 'robotics') interests=$(echo "$V" | grep -c 'Gaming') | hidden skills (expect 0): $(echo "$V" | grep -c 'Rust') hidden history section (expect 0): $(echo "$V" | grep -c 'Contribution history')  email shown (expect 0): $(echo "$V" | grep -c 'asha@uni.edu')"
echo "12 bio script escaped: raw=$(echo "$V" | grep -c '<script>alert') escaped=$(echo "$V" | grep -c '&lt;script&gt;')"
S=$(get $ASHA /profile | un); echo "13 own view shows everything with labels: skills=$(echo "$S" | grep -c 'Rust') labels=$(echo "$S" | grep -o 'Only you\|Visible to members' | sort -u | tr '\n' ';')"
echo "14 viewer checks: anon=$(curl -s -o /dev/null -w '%{http_code}' $B/members/$ASHAID) unverified=$(code $DAN /members/$ASHAID) bad-id=$(code $BEN /members/nope) self=$(curl -s -o /dev/null -w '%{http_code}>%{redirect_url}' -b $ASHA $B/members/$ASHAID)"
echo "15 display name on leaderboard: $(get $BEN /leaderboard | un | grep -c '>Asha K<')"
echo "== C. TRACKS, SAVED, FEATURED =="
post $ASHA /api/posts '{"kind":"post","title":"My robot arm","body":"Built a robot arm with servos.","track":"technical"}' >/dev/null
post $ASHA /api/posts '{"kind":"resource","title":"Rust notes","body":"Notes from the Rust workshop.","url":"https://example.com/rust","confirm":true,"track":"technical"}' >/dev/null
post $BEN /api/posts '{"kind":"question","title":"Best study spot?","body":"Where do people study quietly?","track":"community"}' >/dev/null
PIDS=($(get $ASHA /community | un | grep -o '"postId":"[0-9a-f-]\{36\}"' | grep -o '[0-9a-f-]\{36\}' | awk '!s[$0]++')); POST1=${PIDS[0]}
echo "16 post shows track + author link: $(get $BEN /community | un | grep -c 'Technical')/$(get $BEN /community | un | grep -c "members/$ASHAID")"
echo "17 feature own post: $(post $ASHA /api/profile "${P/\"featured\":\"\"/\"featured\":\"post:$POST1\"}")  shown to member: $(get $BEN /members/$ASHAID | un | grep -c 'My robot arm')"
echo "18 feature someone else's post rejected: $(post $CY /api/profile "{\"name\":\"Cy\",\"avatar\":\"star\",\"bio\":\"\",\"skills\":[],\"interests\":[\"Sports\"],\"visibility\":[],\"featured\":\"post:$POST1\",\"house\":\"kaziranga\"}")"
echo "19 save post: $(post $BEN /api/saved "{\"kind\":\"post\",\"refId\":\"$POST1\",\"saved\":true}")  twice: $(post $BEN /api/saved "{\"kind\":\"post\",\"refId\":\"$POST1\",\"saved\":true}" | cut -c1-20)  fake: $(post $BEN /api/saved '{"kind":"post","refId":"00000000-0000-4000-8000-000000000000","saved":true}')"
echo "20 /saved lists it: $(get $BEN /saved | un | grep -c 'My robot arm')  button flips to Unsave: $(get $BEN /community | un | grep -c 'Unsave')"
echo "21 unsave: $(post $BEN /api/saved "{\"kind\":\"post\",\"refId\":\"$POST1\",\"saved\":false}" | cut -c1-40)  list now: $(get $BEN /saved | un | grep -c 'My robot arm')"
echo "== D. ACHIEVEMENTS (verified only) =="
A=$(get $ASHA /achievements | un); echo "22 fresh member has no earned milestones: $(echo "$A" | grep -c 'Nothing earned yet')  3 raw posts/resource earned nothing: Trusted Sharer still open: $(echo "$A" | grep -c 'Trusted Sharer: 0/1')"
for i in 1 2 3; do post $BOSS /api/admin/quests "{\"title\":\"Tech quest $i\",\"description\":\"Do technical thing number $i.\",\"category\":\"technical learning\",\"xp\":\"5\",\"kind\":\"visit\"}" >/dev/null; done
SL=($(get $ASHA /quests | un | grep -o '"slug":"tech-quest-[0-9]-[a-z0-9]*"' | grep -o 'tech-quest-[0-9]-[a-z0-9]*' | awk '!s[$0]++' | sort))
post $ASHA /api/quests/complete "{\"slug\":\"${SL[0]}\"}" >/dev/null; post $ASHA /api/quests/complete "{\"slug\":\"${SL[1]}\"}" >/dev/null
echo "23 after 2 technical quests: $(get $ASHA /achievements | un | grep -o 'Technical Explorer: [0-9]/3')"
post $ASHA /api/quests/complete "{\"slug\":\"${SL[2]}\"}" >/dev/null; A=$(get $ASHA /achievements | un)
echo "24 after 3: progress line gone (expect 0): $(echo "$A" | grep -c 'Technical Explorer: ')  earned chip: $(echo "$A" | grep -c 'Technical Explorer')"
post $ASHA /api/quests/complete '{"slug":"share-a-tip","proof":"Use the quiet floor for exams please"}' >/dev/null
CID=$(get $BEN /dashboard | ids completion | head -1); echo "25 council approves tip: $(act $BEN "{\"type\":\"completion\",\"id\":\"$CID\",\"decision\":\"approve\"}")  badge on profile: $(get $BEN /members/$ASHAID | un | grep -c 'Helper')"
for s in start; do post $ASHA /api/onboarding '{"step":"start"}' >/dev/null; done; post $ASHA /api/onboarding '{"step":"house","house":"gir"}' >/dev/null; post $ASHA /api/onboarding '{"step":"story"}' >/dev/null; post $ASHA /api/onboarding '{"step":"interests","interests":["Programming","Gaming"]}' >/dev/null; post $ASHA /api/onboarding '{"step":"finish"}' >/dev/null
echo "26 Pathfinder earned after onboarding: $(get $ASHA /achievements | un | grep -c 'Pathfinder: ') (0 = earned)"
QID=$(get $ASHA /questions | un | grep -o 'questions/[0-9a-f-]\{36\}' | head -1 | cut -d/ -f2)
echo "27 Asha answers Ben's question: $(post $ASHA /api/answers "{\"questionId\":\"$QID\",\"body\":\"Third floor east wing is quiet.\"}" | cut -c1-30)"
echo "== E. NOTIFICATIONS =="
echo "28 Ben notified of answer: $(get $BEN /notifications | un | grep -c 'answered your question')  unread in nav API: $(get $BEN /api/me | grep -o '"unread":[0-9]*')"
AID=$(get $BEN /questions/$QID | un | grep -o '"answerId":"[0-9a-f-]\{36\}"' | head -1 | grep -o '[0-9a-f-]\{36\}')
echo "29 Ben accepts: $(post $BEN /api/questions/accept "{\"questionId\":\"$QID\",\"answerId\":\"$AID\"}")  Asha notified: $(get $ASHA /notifications | un | grep -c 'answer was accepted')  Helping Hand earned: $(get $ASHA /achievements | un | grep -c 'Helping Hand: ') (0 = earned)"
echo "    Asha also notified of: quest approved=$(get $ASHA /notifications | un | grep -c 'quest "Share a helpful tip" was approved')"
NID=$(get $BEN /notifications | un | grep -o '"action":"read","id":"[0-9a-f-]\{36\}"' | head -1 | grep -o '[0-9a-f-]\{36\}'); BU=$(get $BEN /api/me | grep -o '"unread":[0-9]*')
echo "30 another member can't mark Ben's notification: $(post $ASHA /api/notifications "{\"action\":\"read\",\"id\":\"$NID\"}" | cut -c1-30)  Ben unread unchanged: $BU -> $(get $BEN /api/me | grep -o '"unread":[0-9]*')"
echo "31 Ben marks all read: $(post $BEN /api/notifications '{"action":"read-all"}' | cut -c1-30) -> $(get $BEN /api/me | grep -o '"unread":[0-9]*')"
echo "== F. EVENTS =="
F1=$(date -u -d '+3 days' +%Y-%m-%dT%H:%M); F2=$(date -u -d '+5 days' +%Y-%m-%dT%H:%M)
post $ASHA /api/events "{\"title\":\"Code night\",\"description\":\"Pair programming evening for all\",\"startsAt\":\"$F1\",\"format\":\"online\",\"track\":\"technical\"}" >/dev/null
post $ASHA /api/events "{\"title\":\"Five-a-side\",\"description\":\"Casual football match\",\"startsAt\":\"$F2\",\"format\":\"offline\",\"track\":\"sports\",\"location\":\"Main field\"}" >/dev/null
EV=($(get $ASHA '/events?when=mine' | un | grep -o '/events/[0-9a-f-]\{36\}' | awk '!s[$0]++' | cut -d/ -f3)); E1=${EV[0]}; E2=${EV[1]}
echo "32 proposals private: Cy sees none=$(get $CY /events | un | grep -c 'Code night') page 404 for Cy=$(code $CY /events/$E1) organizer=$(code $ASHA /events/$E1) council=$(code $BEN /events/$E1) | RSVP to unapproved: $(post $CY /api/events/rsvp "{\"eventId\":\"$E1\",\"status\":\"going\"}")"
act $BEN "{\"type\":\"event\",\"id\":\"$E1\",\"decision\":\"approved\"}" >/dev/null; act $BEN "{\"type\":\"event\",\"id\":\"$E2\",\"decision\":\"approved\"}" >/dev/null
echo "33 organizer notified of approval: $(get $ASHA /notifications | un | grep -c 'Code night" was approved')"
echo "34 filters: all=$(get $CY /events | un | grep -o 'Code night\|Five-a-side' | sort -u | wc -l) sports=$(get $CY '/events?track=sports' | un | grep -o 'Code night\|Five-a-side' | sort -u | tr '\n' '/') offline=$(get $CY '/events?format=offline' | un | grep -o 'Code night\|Five-a-side' | sort -u | tr '\n' '/') online=$(get $CY '/events?format=online' | un | grep -o 'Code night\|Five-a-side' | sort -u | tr '\n' '/') search=$(get $CY '/events?q=football' | un | grep -o 'Code night\|Five-a-side' | sort -u | tr '\n' '/') past=$(get $CY '/events?when=past' | un | grep -c 'Code night')"
echo "35 mine empty before RSVP: $(get $CY '/events?when=mine' | un | grep -c 'Code night')"
echo "36 RSVP going: $(post $CY /api/events/rsvp "{\"eventId\":\"$E1\",\"status\":\"going\"}")  interested(Dev): $(post $DEV /api/events/rsvp "{\"eventId\":\"$E2\",\"status\":\"interested\"}")  organizer notified: $(get $ASHA /notifications | un | grep -c 'Cy is going')"
echo "37 mine after RSVP: $(get $CY '/events?when=mine' | un | grep -c 'Code night')  detail shows attendees to Cy: $(get $CY /events/$E1 | un | grep -c "Who's coming")  hidden from non-registered Dev: $(get $DEV /events/$E1 | un | grep -c "Who's coming")"
echo "38 coordination: Dev blocked=$(post $DEV /api/events/message "{\"eventId\":\"$E1\",\"body\":\"hi there\"}" | cut -c1-60) Cy ok=$(post $CY /api/events/message "{\"eventId\":\"$E1\",\"body\":\"Bringing a laptop\"}" | cut -c1-30) organizer notified=$(get $ASHA /notifications | un | grep -c 'New message about "Code night"')"
post $ASHA /api/events/message "{\"eventId\":\"$E1\",\"body\":\"Room link is in the pinned note\"}" >/dev/null; echo "    attendee notified of organizer message: $(get $CY /notifications | un | grep -c 'New message about "Code night"')  thread visible to Cy: $(get $CY /events/$E1 | un | grep -c 'Room link is')"
echo "39 attendance: self=$(post $CY /api/events/attendance "{\"eventId\":\"$E1\",\"userId\":\"$CYID\",\"attended\":true}" | cut -c1-70)  random student=$(post $DEV /api/events/attendance "{\"eventId\":\"$E1\",\"userId\":\"$CYID\",\"attended\":true}" | cut -c1-40)  not registered=$(post $ASHA /api/events/attendance "{\"eventId\":\"$E1\",\"userId\":\"$DEVID\",\"attended\":true}" | cut -c1-50)"
echo "40 organizer confirms: $(post $ASHA /api/events/attendance "{\"eventId\":\"$E1\",\"userId\":\"$CYID\",\"attended\":true}")  again: $(post $ASHA /api/events/attendance "{\"eventId\":\"$E1\",\"userId\":\"$CYID\",\"attended\":true}" | cut -c1-60)"
echo "44 save event + appears in lists: $(post $DEV /api/saved "{\"kind\":\"event\",\"refId\":\"$E1\",\"saved\":true}" | cut -c1-25)  /saved: $(get $DEV /saved | un | grep -c 'Code night')  my events: $(get $DEV '/events?when=mine' | un | grep -c 'Code night')"
echo "41 Cy sees verified participation: $(get $CY /achievements | un | grep -c 'Code night')  Regular progress: $(get $CY /achievements | un | grep -o 'Regular: [0-9]/3')  +10 XP: $(get $CY /profile >/dev/null; get $CY /dashboard | un | grep -o '+10 · Attended: Code night')  can't un-register: $(post $CY /api/events/rsvp "{\"eventId\":\"$E1\",\"status\":\"none\"}" | cut -c1-50)"
echo "42 council cancels Five-a-side -> Dev notified: $(act $BEN "{\"type\":\"event\",\"id\":\"$E2\",\"decision\":\"cancelled\"}" | cut -c1-30) $(get $DEV /notifications | un | grep -c 'Five-a-side" was cancelled')"
echo "43 council completes Code night: $(act $BEN "{\"type\":\"event\",\"id\":\"$E1\",\"decision\":\"completed\"}" | cut -c1-30)  Event Organizer earned for Asha: $(get $ASHA /achievements | un | grep -c 'Event Organizer: ') (0 = earned)  Cy notified: $(get $CY /notifications | un | grep -c 'Code night" was marked as completed')"
echo "== G. STUDENT DASHBOARD =="
post $CY /api/profile "{\"name\":\"Cy\",\"avatar\":\"ball\",\"bio\":\"\",\"skills\":[],\"interests\":[\"Sports\"],\"visibility\":[],\"featured\":\"\",\"house\":\"kaziranga\"}" >/dev/null
F3=$(date -u -d '+6 days' +%Y-%m-%dT%H:%M); post $ASHA /api/events "{\"title\":\"Sunday run\",\"description\":\"Easy group run\",\"startsAt\":\"$F3\",\"format\":\"offline\",\"track\":\"sports\"}" >/dev/null
post $ASHA /api/events "{\"title\":\"Hack evening\",\"description\":\"Build small things\",\"startsAt\":\"$(date -u -d '+4 days' +%Y-%m-%dT%H:%M)\",\"format\":\"online\",\"track\":\"technical\"}" >/dev/null
for t in "Sunday run" "Hack evening"; do :; done
EV2=($(get $ASHA '/events?when=mine' | un | grep -o '/events/[0-9a-f-]\{36\}' | awk '!s[$0]++' | cut -d/ -f3)); for e in "${EV2[@]}"; do act $BEN "{\"type\":\"event\",\"id\":\"$e\",\"decision\":\"approved\"}" >/dev/null; done
echo "45 announcements: student create=$(post $CY /api/admin/announce '{"title":"Hi all","body":"Hello everyone","audience":"all"}' | cut -c1-40) council=$(post $BEN /api/admin/announce '{"title":"Welcome week","body":"Orientation on Monday","audience":"all"}' | cut -c1-30) admin house-only=$(post $BOSS /api/admin/announce '{"title":"Gir briefing","body":"Ember members meet Friday","audience":"gir"}' | cut -c1-30)"
echo "    Asha(gir) sees: $(get $ASHA /dashboard | un | grep -o 'Welcome week\|Gir briefing' | sort -u | tr '\n' '/')  Cy(kaziranga) sees: $(get $CY /dashboard | un | grep -o 'Welcome week\|Gir briefing' | sort -u | tr '\n' '/')"
post $BEN /api/posts '{"kind":"question","title":"Where is the lab?","body":"Looking for the computer lab please.","track":"technical"}' >/dev/null
C=$(get $CY /dashboard | un)
echo "46 Cy's dashboard sections: $(echo "$C" | grep -o 'Your events\|Upcoming for you\|Quests for you\|Your submissions\|Recent activity\|>Saved<\|Recommended\|Notifications' | sort -u | wc -l)/8"
echo "47 interest-matched sports event listed first & flagged: $(echo "$C" | grep -o 'Upcoming for you.\{0,400\}' | grep -o 'Sunday run\|Hack evening' | head -2 | tr '\n' '>')  flag: $(echo "$C" | grep -c 'matches your interests')"
echo "48 unanswered question list: $(get $CY /dashboard | un | grep -c 'Where is the lab')"
echo "49 attended event in activity: $(echo "$C" | grep -c 'Attended: Code night')"
echo "== H. SETTINGS =="
echo "50 wrong current password: $(post $CY /api/account/password '{"current":"nope-nope-nope","next":"brand-new-pass-1"}')  short new: $(post $CY /api/account/password '{"current":"correct-horse-9","next":"short"}' | cut -c1-40)"
echo "51 change: $(post $CY /api/account/password '{"current":"correct-horse-9","next":"brand-new-pass-1"}')  old login: $(curl -s $J -d '{"email":"cy@uni.edu","password":"correct-horse-9"}' $B/api/auth/login | cut -c1-45)  new login: $(curl -s $J -d '{"email":"cy@uni.edu","password":"brand-new-pass-1"}' $B/api/auth/login | cut -c1-30)"
echo "52 leaderboard opt-out: $(post $CY /api/account '{"leaderboard":false}' | cut -c1-50)  listed now (expect 0): $(get $BEN /leaderboard | un | grep -c '>Cy<')  profile still reachable: $(code $BEN /members/$CYID)  back on: $(post $CY /api/account '{"leaderboard":true}' >/dev/null; get $BEN /leaderboard | un | grep -c '>Cy<')"
echo "53 settings page: $(get $CY /settings | un | grep -o 'Change password\|Leaderboard\|Log out' | sort -u | wc -l)/3"
echo "errors in dev log: $(grep -ciE '⨯|unhandled|TypeError' /tmp/dev3190.log)"
stopdev 3190
