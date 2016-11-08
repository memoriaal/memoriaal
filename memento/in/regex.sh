#! /bin/bash

filenumber=6-5
infile="$filenumber"-in.txt
outfile="$filenumber".txt
cp "$infile" "$outfile"

npm install replace -g
cp "$infile" "$outfile"
sed 's/\<b\>[aA]rr\. *\<\/b\>/arr\. /g' "$outfile" > 1."$outfile"
sed 's/\<b\>[kK]üüdit. *\<\/b\>/küüdit. /g' 1."$outfile" > 2."$outfile"
sed 's/\<b\>[aA]sum. *\<\/b\>/asum. /g' 2."$outfile" > 3."$outfile"
sed 's/^\<b\>/\<nimi\>/g' 3."$outfile" > 4."$outfile"

tr '\n' ' ' < 4."$outfile" > 5."$outfile"
sed $'s/\<nimi\>/\\\n\<nimi\>/g' 5."$outfile" > 6."$outfile"

cp 6."$outfile" 7."$outfile"
replace '<b>(.*?)</b>' '$1' 7."$outfile"
replace '(<nimi>.*?</)b>' '$1nimi>' 7."$outfile"

cp 7."$outfile" 8."$outfile"
replace '"' '\"' 8."$outfile"
replace '<nimi>(.*)</nimi>(.*)' '{"nimi":"$1","kirje":"$2"},' 8."$outfile"



\</nimi\> , ([a-z õüäö]*),
</nimi><sugulus>$1</sugulus>

\</nimi\> ka ([a-zõüõäö, ]*),
</nimi><aliased>$1</aliased>
