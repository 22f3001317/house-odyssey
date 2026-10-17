J='-H Content-Type:application/json'
# reg <name> <email> <jar> [simulate=1]: signup -> confirm email -> login -> (simulate ID verification)
reg() {
  XF="-H X-Forwarded-For:10.$((RANDOM%250)).$((RANDOM%250)).$((RANDOM%250))"
  R=$(curl -s -m 120 $XF $J -d "{\"name\":\"$1\",\"email\":\"$2\",\"password\":\"correct-horse-9\"}" $B/api/auth/signup)
  T=$(echo "$R" | grep -o 'token=[a-f0-9]*' | cut -d= -f2)
  curl -s $XF $J -d "{\"token\":\"$T\"}" $B/api/auth/verify >/dev/null
  curl -s $XF -c $3 $J -d "{\"email\":\"$2\",\"password\":\"correct-horse-9\"}" $B/api/auth/login >/dev/null
  [ "${4:-1}" = "1" ] && curl -s -b $3 -X POST $B/api/auth/simulate >/dev/null
  [ "${4:-1}" = "1" ] && [ "${5:-gir}" != "none" ] && curl -s $XF -b $3 $J -d "{\"step\":\"house\",\"house\":\"${5:-gir}\"}" $B/api/onboarding >/dev/null
}
post() { curl -s -b $1 $J -d "$3" $B$2; }   # post <jar> <path> <json>
get()  { curl -s -b $1 $B$2; }              # get <jar> <path>
code() { curl -s -o /dev/null -w '%{http_code}' -b $1 $B$2; }
startdev() { # startdev <port> [ENV=val ...]
  P=$1; shift; cd "${ROOT:-$(pwd)}" && rm -rf .data
  env PORT=$P "$@" setsid nohup npx next dev -p $P >/tmp/dev$P.log 2>&1 &
  echo $! > /tmp/dev$P.pid
  sleep 8; B=localhost:$P
}
stopdev() { kill -- -$(cat /tmp/dev$1.pid) 2>/dev/null; }
