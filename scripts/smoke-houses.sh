#!/bin/bash
. "$(dirname "$0")/lib.sh"
ROOT_DIR="${ROOT:-$(pwd)}"
cd "$ROOT_DIR"
CSS=$(cat .next/static/chunks/*.css 2>/dev/null | tr -d '\n')
startdev 3210 ADMIN_EMAILS=boss@uni.edu
un() { sed 's/<!-- -->//g;s/&quot;/"/g'; }
BOSS=/tmp/boss9; EVE=/tmp/eve9; DAN=/tmp/dan9; rm -f $BOSS $EVE $DAN
reg Boss boss@uni.edu $BOSS 1 none; reg Eve eve@uni.edu $EVE 1 none; reg Dan dan@uni.edu $DAN 0
loc() { curl -s -o /dev/null -w '%{http_code}>%{redirect_url}' -b $1 $B$2 | sed "s#http://$B##"; }
echo "== MANDATORY HOUSE =="
echo "1 /api/me before choosing: $(get $EVE /api/me | grep -o '"house":[^,}]*')"
echo "2 student without house is sent to onboarding: dashboard=$(loc $EVE /dashboard) community=$(loc $EVE /community) quests=$(loc $EVE /quests) events=$(loc $EVE /events) saved=$(loc $EVE /saved) notifications=$(loc $EVE /notifications)"
echo "   but can open: onboarding=$(code $EVE /onboarding) profile/edit=$(code $EVE /profile/edit) settings=$(code $EVE /settings)"
echo "3 API blocked: post=$(post $EVE /api/posts '{"kind":"post","title":"Hello","body":"Hello there everyone"}' | cut -c1-70)  quest=$(post $EVE /api/quests/complete '{"slug":"read-guidelines"}' | cut -c1-40)  rsvp=$(post $EVE /api/events/rsvp '{"eventId":"00000000-0000-4000-8000-000000000000","status":"going"}' | cut -c1-40)"
echo "4 onboarding steps need a house: story=$(post $EVE /api/onboarding '{"step":"story"}' | cut -c1-45) interests=$(post $EVE /api/onboarding '{"step":"interests","interests":[]}' | cut -c1-45) finish=$(post $EVE /api/onboarding '{"step":"finish"}' | cut -c1-45) skip=$(post $EVE /api/onboarding '{"step":"skip"}' | cut -c1-45)"
echo "5 onboarding page offers house choice, no skip-around: $(get $EVE /onboarding | un | grep -c 'Choosing a house is the one required step')  'Skip the introduction' (expect 0): $(get $EVE /onboarding | un | grep -c 'Skip the introduction')"
PBASE='"name":"Eve","avatar":"owl","bio":"","skills":[],"interests":[],"visibility":[],"featured":""'
echo "6 profile needs a valid house: none=$(post $EVE /api/profile "{$PBASE}" | cut -c1-50) old-demo-house=$(post $EVE /api/profile "{$PBASE,\"house\":\"ember\"}" | cut -c1-50) made-up=$(post $EVE /api/profile "{$PBASE,\"house\":\"hogwarts\"}" | cut -c1-50)"
echo "7 admin without a house still reaches the dashboard: $(loc $BOSS /dashboard)  sees: $(get $BOSS /dashboard | un | grep -o 'Admin dashboard' | head -1)"
echo "8 unverified student still sees verification panel (not redirected): $(loc $DAN /dashboard)"
echo "== CHOOSING A HOUSE =="
echo "9 pick Kanha in onboarding: $(post $EVE /api/onboarding '{"step":"house","house":"kanha"}')  me: $(get $EVE /api/me | grep -o '"house":[^,}]*')"
echo "10 gate lifts: dashboard=$(loc $EVE /dashboard) community=$(loc $EVE /community)  can post now: $(post $EVE /api/posts '{"kind":"post","title":"Hello Kanha","body":"Hello from the barasingha corner"}' | cut -c1-30)"
echo "11 change house in profile: $(post $EVE /api/profile "{$PBASE,\"house\":\"nilgiri\"}")  me: $(get $EVE /api/me | grep -o '"house":[^,}]*')  dashboard shows: $(get $EVE /dashboard | un | grep -o 'Nilgiri House' | head -1)"
echo "12 member profile page shows house + companion: $(get $EVE /profile | un | grep -o 'Nilgiri House' | head -1)"
echo "== THE 12 HOUSES =="
echo "13 /houses lists all 12: $(get $EVE /houses | un | grep -o '[A-Za-z]* House</h3>' | sort -u | wc -l)  names: $(get $EVE /houses | un | grep -o '>[A-Za-z]* House</h3>' | sed 's/<\/h3>//;s/>//' | sort | tr '\n' ',')"
echo "14 every house page works: $(for s in saranda nallamala pichavaram sundarbans wayanad namdapha gir kanha bandipur corbett nilgiri kaziranga; do printf "%s=%s " $s $(code $EVE /houses/$s); done)"
echo "15 old demo houses are gone: ember=$(code $EVE /houses/ember) tide=$(code $EVE /houses/tide) grove=$(code $EVE /houses/grove) gale=$(code $EVE /houses/gale) (expect 404s)"
echo "16 house page content: $(get $EVE /houses/gir | un | grep -o 'Gir National Park, Gujarat\|Asiatic lion' | sort -u | tr '\n' ';')  place for Corbett: $(get $EVE /houses/corbett | un | grep -c 'Jim Corbett National Park, Uttarakhand')"
echo "17 home page cards for all 12 (and no demo names): $(curl -s $B/ | un | grep -o '[A-Za-z]* House</h3>' | sort -u | wc -l) / demo: $(curl -s $B/ | un | grep -c 'Ember House\|Tide House')"
echo "18 footer wording is honest: $(curl -s $B/ | un | grep -o 'not official logos' | head -1)"
echo "19 data file: houses=$(grep -c '^  h("' $ROOT_DIR/src/data/seed.ts) companions by basis: house-site=$(grep -o 'basis: "house-site"' $ROOT_DIR/src/data/seed.ts | wc -l) park=$(grep -o 'basis: "park"' $ROOT_DIR/src/data/seed.ts | wc -l) unconfirmed=$(grep -o 'basis: "unconfirmed"' $ROOT_DIR/src/data/seed.ts | wc -l)"
echo "== BACKGROUND =="
echo "20 animation CSS shipped: walk=$(echo "$CSS" | grep -c '@keyframes walk') fly=$(echo "$CSS" | grep -c '@keyframes fly') hop=$(echo "$CSS" | grep -c '@keyframes hop') reduced-motion static fallback=$(echo "$CSS" | grep -c 'prefers-reduced-motion')"
echo "21 backdrop is decorative: $(grep -c 'aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10' $ROOT_DIR/src/components/Backdrop.tsx) (1 = hidden from screen readers, no clicks, behind content)"
echo "22 scene data: savanna set has deer/monkey/jackal/predators/birds/insects: $(grep -o 'SAVANNA = {[^}]*}' $ROOT_DIR/src/components/Backdrop.tsx | grep -o '🦌\|🐒\|🐺\|🐅\|🐆\|🦅\|🦜\|🦋\|🐝' | sort -u | tr '\n' ' ')"
echo "errors in dev log: $(grep -ciE '⨯|unhandled|TypeError' /tmp/dev3210.log)"
stopdev 3210
