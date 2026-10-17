#!/bin/bash
. "$(dirname "$0")/lib.sh"
ROOT_DIR="${ROOT:-$(pwd)}"
startdev 3220 ADMIN_EMAILS=boss@uni.edu
ids() { sed 's/\\"/"/g' | grep -o "\"type\":\"$1\",\"id\":\"[0-9a-f-]\{36\}\"" | grep -o '[0-9a-f-]\{36\}' | awk '!s[$0]++'; }
xp() { get $1 /dashboard | sed 's/<!-- -->//g' | grep -o '[0-9]* XP' | head -1; }
BOSS=/tmp/boss5; BEN=/tmp/ben5; ASHA=/tmp/asha5; CY=/tmp/cy5; rm -f $BOSS $BEN $ASHA $CY
act() { post $1 /api/admin/action "$2"; }
reg Boss boss@uni.edu $BOSS 1; reg Ben ben@uni.edu $BEN 1
BENID=$(get $BOSS /dashboard | ids role | head -1)
echo "== STAGE 5 =="
echo "1 boss is admin: $(get $BOSS /api/me | grep -o '"role":"[a-z]*","admin":[a-z]*')"
echo "2 promote Ben to council: $(act $BOSS "{\"type\":\"role\",\"id\":\"$BENID\",\"role\":\"council\"}")"
reg Asha asha@uni.edu $ASHA 1; reg Cy cy@uni.edu $CY 0
echo "3 dashboards by role (queues visible?): student=$(get $ASHA /dashboard | grep -c 'Quest approvals') council=$(get $BEN /dashboard | grep -c 'Quest approvals') admin=$(get $BOSS /dashboard | grep -c 'Quest approvals') anon=$(curl -s -o /dev/null -w '%{http_code}' $B/dashboard)  (expect 0, >0, >0, 307)"
echo "4 student admin API: $(act $ASHA '{"type":"quest","id":"00000000-0000-0000-0000-000000000000","active":false}')"
echo "5 student self-promote attempt: $(act $ASHA "{\"type\":\"role\",\"id\":\"$BENID\",\"role\":\"student\"}")"
post $ASHA /api/quests/complete '{"slug":"share-a-tip","proof":"Use the library quiet floor for exams"}' >/dev/null
post $ASHA /api/quests/complete '{"slug":"attend-meetup","proof":"I attended the Tide welcome walk"}' >/dev/null
post $ASHA /api/posts '{"kind":"resource","title":"Unit 1 notes","body":"Handwritten notes shared by me","url":"https://example.com/n","confirm":true}' >/dev/null
post $ASHA /api/posts '{"kind":"post","title":"Buy cheap followers","body":"spam spam spam spam spam"}' >/dev/null
F1=$(date -u -d '+7 days' +%Y-%m-%dT%H:%M); F2=$(date -u -d '+8 days' +%Y-%m-%dT%H:%M)
post $ASHA /api/events "{\"title\":\"Tide welcome walk\",\"description\":\"A walk for new students\",\"startsAt\":\"$F1\",\"format\":\"offline\",\"location\":\"Main gate\"}" >/dev/null
post $ASHA /api/events "{\"title\":\"Quiz night\",\"description\":\"A tech quiz for all houses\",\"startsAt\":\"$F2\",\"format\":\"online\"}" >/dev/null
PID=$(get $ASHA /community | sed 's/\\"/"/g' | grep -o '"postId":"[0-9a-f-]\{36\}"' | head -1 | grep -o '[0-9a-f-]\{36\}')
echo "6 report spam: $(post $BEN /api/reports "{\"postId\":\"$PID\",\"reason\":\"spam\"}")"
AB=$(get $BEN /dashboard); AA=$(get $BOSS /dashboard)
echo "7 council sees $(echo "$AB" | grep -o 'Quest approvals\|Resource moderation\|Reported content\|Event proposals' | sort -u | wc -l)/4 core sections; verification=$(echo "$AB" | grep -c 'Student verification') inbox=$(echo "$AB" | grep -c 'Contact inbox') | admin: verification=$(echo "$AA" | grep -c 'Student verification') inbox=$(echo "$AA" | grep -c 'Contact inbox')"
C=($(echo "$AB" | ids completion)); echo "   pending completions found: ${#C[@]}"
echo "8 approve #1: $(act $BEN "{\"type\":\"completion\",\"id\":\"${C[0]}\",\"decision\":\"approve\"}")"
echo "9 approve again: $(act $BEN "{\"type\":\"completion\",\"id\":\"${C[0]}\",\"decision\":\"approve\"}")"
echo "10 reject #2: $(act $BEN "{\"type\":\"completion\",\"id\":\"${C[1]}\",\"decision\":\"reject\"}")"
echo "11 Asha XP (one approval only, 40 or 50): $(xp $ASHA)"
RID=$(echo "$AB" | ids post | head -1)
echo "12 resource hidden before publish (expect 0): $(get $ASHA /resources | grep -c 'Unit 1 notes')"
echo "13 publish resource: $(act $BEN "{\"type\":\"post\",\"id\":\"$RID\",\"decision\":\"publish\"}")  now visible: $(get $ASHA /resources | grep -c 'Unit 1 notes')"
echo "14 hide reported post: $(act $BEN "{\"type\":\"post\",\"id\":\"$PID\",\"decision\":\"hide\"}")  still listed (expect 0): $(get $ASHA /community | grep -c 'Buy cheap')"
E=($(get $BEN /dashboard | ids event)); echo "   events found: ${#E[@]}"
echo "15 approve event1: $(act $BEN "{\"type\":\"event\",\"id\":\"${E[0]}\",\"decision\":\"approved\"}")"
echo "16 complete an unapproved event: $(act $BEN "{\"type\":\"event\",\"id\":\"${E[1]}\",\"decision\":\"completed\"}")"
echo "17 approved event on public home: $(curl -s $B/ | grep -c 'Tide welcome walk')  location leaked (expect 0): $(curl -s $B/ | grep -c 'Main gate')"
BEFORE=$(xp $ASHA)
echo "18 complete event1: $(act $BEN "{\"type\":\"event\",\"id\":\"${E[0]}\",\"decision\":\"completed\"}")  XP $BEFORE -> $(xp $ASHA)"
echo "19 complete again: $(act $BEN "{\"type\":\"event\",\"id\":\"${E[0]}\",\"decision\":\"completed\"}")"
CYID=$(get $BOSS /dashboard | ids user | head -1)
echo "20 Cy blocked before verify: $(post $CY /api/posts '{"kind":"post","title":"Hello","body":"Hello world again"}')"
echo "21 council verifies user: $(act $BEN "{\"type\":\"user\",\"id\":\"$CYID\",\"decision\":\"verified\"}")"
echo "22 admin verifies user: $(act $BOSS "{\"type\":\"user\",\"id\":\"$CYID\",\"decision\":\"verified\"}")  Cy posts: $(post $CY /api/posts '{"kind":"post","title":"Hello","body":"Hello world again"}' | cut -c1-12)"
echo "23 council creates quest: $(post $BEN /api/admin/quests '{"title":"Campus trivia","description":"Name the library floor that is quiet.","category":"onboarding","xp":"25","kind":"trivia","answer":"Third|3rd"}')"
echo "24 bad quest: $(post $BEN /api/admin/quests '{"title":"Bad quest","description":"Missing the answer here.","category":"onboarding","xp":"0","kind":"trivia"}')"
echo "25 student creates quest: $(post $ASHA /api/admin/quests '{"title":"Nope nope","description":"Trying to sneak one in","category":"onboarding","xp":"5","kind":"visit"}')"
echo "26 new quest on board: $(get $ASHA /quests | grep -c 'Campus trivia')"
QID=$(get $BEN /dashboard | sed 's/\\"/"/g' | grep -o '"type":"quest","id":"[0-9a-f-]\{36\}","active":false' | head -1 | grep -o '[0-9a-f-]\{36\}')
echo "27 archive a quest: $(act $BEN "{\"type\":\"quest\",\"id\":\"$QID\",\"active\":false}")"
curl -s $J -d '{"name":"Visitor","email":"v@x.com","subject":"Hello","message":"Do you run tours?"}' $B/api/contact >/dev/null
echo "28 inbox: admin=$(get $BOSS /dashboard | grep -c 'Do you run tours') council(expect 0)=$(get $BEN /dashboard | grep -c 'Do you run tours')"
echo "29 admin XP history: $(get $BOSS /dashboard | grep -c 'Event completed')  metrics blocks: $(get $BOSS /dashboard | sed 's/<!-- -->//g' | grep -o 'Members\|Verified\|Published posts\|Awaiting review' | sort -u | wc -l)/4"
echo "errors in dev log: $(grep -ciE '⨯|unhandled|TypeError' /tmp/dev3220.log)"
stopdev 3220
