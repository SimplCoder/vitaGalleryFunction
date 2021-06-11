export class QrcodeVal{
    static  validateQRCode( qrCode:any){
        console.log("validateQRCode");
        const codeSize=4;
        let asci= qrCode.substring(codeSize,qrCode.length-1);
        if(isNaN(asci))return false;    
        let withoutAsci = qrCode.substring(0, codeSize);
        let randomChar= qrCode.substring(qrCode.length-1);
        let ascisum= parseInt(asci);
        console.log("ascisum");
        console.log(ascisum);
        let actualAsci= sumAscii(withoutAsci);
        console.log("sumAscii");
        console.log(actualAsci);
        let actualRandomChar=asciiCharFromName(ascisum);
        console.log("asciiCharFromName");
        if(ascisum==actualAsci && randomChar.charAt(0)==actualRandomChar)return true;
        console.log("invalid"+qrCode);
        return false;
    }
}

const MY_NAME_ENCRYPTION= "rupeshdhadiwal";
function  sumAscii( str:any)
    {
        // To store the sum
        let n = str.length;
        let sum = 0;

        // For every character
        for (let i = 0; i < n; i++)
        {
            sum += parseInt(str.charCodeAt(i));
            console.log("for"+i+"sdf n" +n);
        }

        return sum;
    }
    function asciiCharFromName(num:any){
      let n= num;
      let sum =n;
      console.log(n);
      while (n != 0)
      { console.log("while ");
        console.log(n)
          sum = sum + n % 10;
          n = n/10;
          n= parseInt(n);
      }
      let tenthPositionInt= sum%10;
      return MY_NAME_ENCRYPTION.charAt(tenthPositionInt);
  }
