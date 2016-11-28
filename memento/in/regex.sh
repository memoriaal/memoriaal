#! /bin/bash

# npm install replace -g

# declare -a arr=("6-1" "6-5")
declare -a arr=("6-1" "6-2" "6-3" "6-4" "6-5")
touch memento.txt
rm memento.txt

for filenumber in "${arr[@]}"
do
  infile="$filenumber"-in.txt
  outfile="$filenumber".txt
  cp "$infile" "$outfile"

  sed -r 's_((. )|^|<b>)[aA]rr(et(eeriti|\.)|\.) ?($|</b>)?_\2arr. _g' "$outfile" > 1."$outfile"
  sed -r 's_<b>[kK](ü|u\u0308){1,2}d(\.|it(\.|ati)) ?($|</b>)_küüdit. _g' 1."$outfile" > 2."$outfile"
  sed -r 's_<b>[aA]sum. ?($|</b>)_asum. _g' 2."$outfile" > 3."$outfile"
  sed -r 's_^<b>_<nimi>_g' 3."$outfile" > 4."$outfile"

  tr '\n' ' ' < 4."$outfile" > 5."$outfile"
  sed $'s/<nimi>/\\\n<nimi>/g' 5."$outfile" | tail -n +2 > 6."$outfile"

  cp 6."$outfile" 7."$outfile"
  replace '(<nimi>.*?</)b>' '$1nimi>' 7."$outfile"
  replace '<b>' '' 7."$outfile"
  replace '</b>' '' 7."$outfile"

  cp 7."$outfile" 8."$outfile"
  replace '"' '\"' 8."$outfile"

  cp 8."$outfile" 9."$outfile"
  # replace '</nimi>(((e|i)n\.* )*ka) ([a-z ,õüäö]*), ' '<alias type="$1">$4</alias>' 9."$outfile"

  awk '{printf("<mid>'${filenumber}'-%05d</mid>%s\n", NR, $0)}' 9."$outfile" >> m.txt

  rm   "$outfile"
  rm 1."$outfile"
  rm 2."$outfile"
  rm 3."$outfile"
  rm 4."$outfile"
  rm 5."$outfile"
  rm 6."$outfile"
  rm 7."$outfile"
  rm 8."$outfile"
  rm 9."$outfile"

done

sed $'s/<mid>/- memento: /g' m.txt > m.id.txt
sed $'s/<\/mid><nimi>/\\\n  nimi: /g' m.id.txt > m.nimi.txt
sed $'s/<\/nimi>/\\\n  kirje: /g' m.nimi.txt > memento.yaml

rm m.txt
rm m.id.txt
rm m.nimi.txt

# cp 8."$outfile" "$filenumber".json
# replace '<nimi>(.*)</nimi>(.*)' '{"nimi":"$1","kirje":"$2"},' "$filenumber".json



# \</nimi\> , ([a-z õüäö]*),
# </nimi><sugulus>$1</sugulus>
#
# \</nimi\> ka ([a-zõüõäö, ]*),
# </nimi><aliased>$1</aliased>
