#!/bin/bash
. "$(dirname "$0")/lib.sh"
startdev 3196 ADMIN_EMAILS=boss@uni.edu
ids() { sed 's/\\"/"/g' | grep -o "\"type\":\"$1\",\"id\":\"[0-9a-f-]\{36\}\"" | grep -o '[0-9a-f-]\{36\}' | awk '!s[$0]++'; }
strip() { sed 's/<!-- -->//g'; }
BOSS=/tmp/boss7; BEN=/tmp/ben7; ASHA=/tmp/asha7; CY=/tmp/cy7; F1=/tmp/f17; F2=/tmp/f27; rm -f $BOSS $BEN $ASHA $CY $F1 $F2
reg Boss boss@uni.edu $BOSS 1; reg Ben ben@uni.edu $BEN 1
BENID=$(get $BOSS /admin | ids role | head -1)
post $BOSS /api/admin/action "{\"type\":\"role\",\"id\":\"$BENID\",\"role\":\"council\"}" >/dev/null
reg Asha asha@uni.edu $ASHA 1; reg Cy cy@uni.edu $CY 0; reg "=1+1" f1@uni.edu $F1 1; reg "<b>Bold</b>" f2@uni.edu $F2 1
curl -s -H X-Forwarded-For:10.9.9.9 $J -d '{"name":"Dan","email":"dan@uni.edu","password":"correct-horse-9"}' $B/api/auth/signup >/dev/null
echo "== ANALYTICS =="
echo "1 analytics tab content by role (expect 0 0 >0): student=$(get $ASHA '/dashboard?tab=analytics' | grep -c 'Active members per day') council=$(get $BEN '/dashboard?tab=analytics' | grep -c 'Active members per day') admin=$(get $BOSS '/dashboard?tab=analytics' | grep -c 'Active members per day')"
echo "2 members tab content by role (expect 0 0 >0): student=$(get $ASHA '/dashboard?tab=members' | grep -c 'Download CSV') council=$(get $BEN '/dashboard?tab=members' | grep -c 'Download CSV') admin=$(get $BOSS '/dashboard?tab=members' | grep -c 'Download CSV')"
echo "3 CSV export codes (403=blocked): student=$(code $ASHA /api/admin/export) council=$(code $BEN /api/admin/export) anon=$(curl -s -o /dev/null -w '%{http_code}' $B/api/admin/export) admin=$(code $BOSS /api/admin/export)"
QID_FAKE=00000000-0000-4000-8000-000000000000
for p in / / / /houses /houses/ember /houses/nope /questions/$QID_FAKE /admin/secret /api/x "/dashboard?x=1"; do curl -s -o /dev/null -X POST $J -d "{\"path\":\"$p\"}" $B/api/track; done
curl -s -o /dev/null -X POST $J -d "{\"path\":\"/$(printf 'a%.0s' {1..300})\"}" $B/api/track; curl -s -o /dev/null -X POST $J -d 'not json' $B/api/track
echo "4 track returns: $(curl -s -o /dev/null -w '%{http_code}' -X POST $J -d '{"path":"/"}' $B/api/track) (204 = silent)   [sent 11 valid-or-ignored hits; 1 more '/' just now]"
post $ASHA /api/posts '{"kind":"post","title":"First post","body":"Hello from Asha, first post"}' >/dev/null
post $ASHA /api/posts '{"kind":"question","title":"Where is the library?","body":"Looking for the quiet floor please."}' >/dev/null
post $ASHA /api/quests/complete '{"slug":"house-trivia","answer":"4"}' >/dev/null
QID=$(get $BEN /questions | grep -o '/questions/[0-9a-f-]\{36\}' | head -1 | cut -d/ -f3)
post $BEN /api/answers "{\"questionId\":\"$QID\",\"body\":\"Third floor, east wing.\"}" >/dev/null
A=$(get $BOSS /dashboard?tab=analytics | strip)
echo "5 KPI cards: $(echo "$A" | grep -o '>[0-9]*</p><p class="text-sm">[A-Za-z0-9 ()]*' | sed 's/<\/p><p class="text-sm">/ = /; s/^>//' | tr '\n' ';')"
echo "   expected: Members 7, Verified 5, Awaiting 1, Not confirmed 1, Active today 5, Page views 9"
echo "6 top pages: $(echo "$A" | grep -o '<li>/[^<]* · [0-9]*</li>' | sed 's/<[^>]*>//g' | tr '\n' ';')"
echo "7 charts rendered (expect 4): $(echo "$A" | grep -o 'role="img"' | wc -l)   admin paths excluded (expect 0): $(echo "$A" | grep -c '/admin/secret')"
echo "8 top contributors has Asha(2 posts, 1 quest): $(echo "$A" | grep -c 'Asha<span class="block text-xs">No house yet</span></td><td class="[^"]*">2</td><td class="[^"]*">0</td><td class="[^"]*">1</td>')  Ben(1 answer): $(echo "$A" | grep -c 'Ben<span class="block text-xs">No house yet</span></td><td class="[^"]*">0</td><td class="[^"]*">1</td>')"
echo "9 funnel+houses+quests+content sections: $(echo "$A" | grep -o 'Onboarding progress\|>Houses<\|Quest completions\|>Content<' | sort -u | wc -l)/4   quest 'House trivia: 1 done': $(echo "$A" | grep -c 'House trivia: 1 done')"
U=$(get $BOSS /dashboard?tab=members | strip)
echo "10 users page rows (expect 7 emails): $(echo "$U" | grep -o '[a-z0-9]*@uni.edu' | sort -u | wc -l)   '7 signed-up members': $(echo "$U" | grep -c '7 signed-up')"
echo "11 search 'asha' -> emails shown: $(get $BOSS '/dashboard?tab=members&q=asha' | strip | grep -o '[a-z0-9]*@uni.edu' | sort -u | tr '\n' ' ')"
echo "12 name with HTML shown escaped (raw tag expect 0, escaped >0): raw=$(echo "$U" | grep -c '<b>Bold</b>') esc=$(echo "$U" | grep -c '&lt;b&gt;Bold')"
echo "13 last seen filled for active users (expect no 'never' for boss): $(echo "$U" | grep -o 'boss@uni.edu.\{0,260\}' | grep -c never)"
CSV=$(curl -s -b $BOSS $B/api/admin/export)
echo "14 CSV lines (expect 8): $(echo "$CSV" | wc -l)   header: $(echo "$CSV" | head -1)"
echo "15 formula cell neutralised: $(echo "$CSV" | grep -c '"'"'"'=1+1"')  (unsafe raw =1+1 as first char, expect 0): $(echo "$CSV" | grep -c '^"=1+1"')"
echo "16 CSV headers: $(curl -s -b $BOSS -D - -o /dev/null $B/api/admin/export | grep -i 'content-type\|content-disposition' | tr -d '\r' | tr '\n' ' ')"
echo "17 (obsolete: links replaced by tabs)"
echo "errors in dev log: $(grep -ciE '⨯|unhandled|TypeError' /tmp/dev3196.log)"
stopdev 3196
