const chalk = require('chalk');
const figlet = require('figlet');
var readline = require('readline');
var request = require("request");
var fs = require("fs");
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
var credits = ["TheActent","Rand","Gravity","Triquetra"];
console.log(
    chalk.yellow(
        figlet.textSync('dc-tools', { horizontalLayout: 'full' })
    )
);
console.log("  usercybe/dc-tools \(daha fazlası için credits yaz.\)");
var cmdinfo = {
    "help": "help <komut>",
    "clear": "clear <banner olsunmu [1]>",
    "credits": "tool önerenler.",
    "delete-webhook": "delete-webhook <webhook_url>",
    "send-webhook": "send-webhook <webhook_url> <mesaj>",
    /*"spam-webhook": "spam-webhook: <mesaj> <kac_kere> <interval>",*/
    "spammer": "spammer <token dosyası> <mesaj> <kac_kere> <interval> <kanal_id> <inv_id>",
    "react-spammer": "react-spamer <token dosyası> <kanal id> <mesaj id> <emoji ismi>:<emoji id>",
    "bot-finder": "bot-finder <token>",
    "add-hypesquad": "add-hypesquad <token> <1=bravery,2=brilliance,3=balance>",
    "check-token": "check-token <token dosyası> <çalışanların çıkacağı dosyanın ismi>",
    "exit": "dc-tools'dan çıkar."
};
var commands = {
    "help": (args) => {
        if(args[1]) {
            args[1] = args[1].toLowerCase();
            if(!cmdinfo[args[1]]) {
                console.log("\""+args[1]+"\" diye bir tool bulunamadı.");
                program();
                return;
            }
            console.log(args[1]+": "+cmdinfo[args[1]]);
            program();
            return;
        }
        var cmds = Object.getOwnPropertyNames(commands);
        for(var i = 0;i<cmds.length;i++) {
            cmds[i] = "  "+cmds[i];
        }
        console.log("komutlar: \n"+cmds.join("\n")+"\n\n    "+cmds.length+" komut bulundu.");
        program();
    },
    "clear": (args) => {
        console.clear();
        if(args[1]=="1") {
            console.log(
                chalk.yellow(
                    figlet.textSync('dc-tools', { horizontalLayout: 'full' })
                )
            );            
        }
        program();
    },
    "credits": (args)=>{
        console.log(credits.join(", ")+".");
        program();
    },
    "delete-webhook": (args)=>{
        if(args[1] && args[1].startsWith("https://discordapp.com/api/")) {
            request.delete(args[1]);
            console.log("webhook silindi.");
        } else {
            console.log("webhook url'si doğru değil.");
        }
        program();
    },
    "send-webhook": (args)=>{
        if(args[1] && args[1].startsWith("https://discordapp.com/api/")) {
            var msg = "";
            for(var z=0;z<args[2].length;z++) {
                if(args[2].charAt(z) == "_") {
                    if(z>0) {
                        if(args[2].charAt(z-1) !== "\\") {
                            msg += " ";
                            continue;
                        }
                    }
                }
                msg += args[2].charAt(z);
            }
            request.post(args[1],{
                json: true,
                body: {
                    content: msg
                }
            })
            console.log("webhook mesajı gönderildi.");
        } else {
            console.log("webhook url'si doğru değil.");
        }
        program();
    },
    "spammer": (args)=>{
        // spammer token.txt selam_moruk 10 1000 726824612431790214 NdzgP8
        if(args[1] && fs.existsSync(args[1]) && args[2] && args[3] && parseInt(args[3],10) !== NaN && args[4] && parseInt(args[4],10) !== NaN && args[5] && args[6]) {
            var tokens = fs.readFileSync(args[1]).toString().split("\n");
            var msg = "";
            for(var z=0;z<args[2].length;z++) {
                if(args[2].charAt(z) == "_") {
                    if(z>0) {
                        if(args[2].charAt(z-1) !== "\\") {
                            msg += " ";
                            continue;
                        }
                    }
                }
                msg += args[2].charAt(z);
            }
            for(var v=0;v<tokens.length;v++) {
                request.post("https://discordapp.com/api/v6/invites/"+args[6],{headers:{"authorization":tokens[v]}});
                console.log("token "+v+" sunucuya giriş yaptı.");
            }
            var y=0;
            var ty=0;
            var spamintr = setInterval(()=>{
                y++;
                ty++;
                if(y >= tokens.length) { y = 0; }
                if(ty !== 0 && ty>parseInt(args[3],10)) {
                    console.log("spam tamamlandı.");
                    program();
                    clearInterval(spamintr);
                }
                request({
                    method: "POST",
                    url: `https://discordapp.com/api/v7/channels/${args[5]}/messages`,
                    json: true,
                    headers: {
                      "authorization": tokens[y],
                      "accept": "/",
                      "authority": "discordapp.com",
                      "content-type": "application/json"
                    },
                    body: {
                      content: msg
                    }
                  });
            },parseInt(args[4]));
            console.log("token "+y+" bir mesaj gönderildi.");
        }
        else {
            console.log("hata oluştu.");
            program();
        }
    },
    "react-spammer": (args) => {
        // react-spamer <token dosyası> <kanal id> <mesaj id> <emoji ismi>:<emoji id>
        if(args[1] && args[2] && args[3] && args[4] && fs.existsSync(args[1])) {
            var tokens = fs.readFileSync(args[1]).toString().split("\n");
            var kt = 0;
            tokens.forEach(tkn=>{
                kt++;
                request({
                    method: "PUT",
                    url: "https://discordapp.com/api/v8/channels/"+args[2]+"/messages/"+args[3]+"/reactions/"+encodeURIComponent(args[4])+"/@me",
                    headers: {
                        authorization: tkn
                    }
                });
                console.log(kt+". token "+args[4]+" isimli emojiye tepki verdi.");
                if(kt === tokens.length) {
                    console.log("işlem tamamlandı.");
                    program();
                }
            });
        } else {
            program();
        }
    },
    "bot-finder": (args) => {
        if(!args[1]) {
            console.log("hata oluştu.");
            program();
            return;
        }
        console.log("hesaptaki botlar:\n");
        request({
            method: "GET",
            url: "https://discord.com/api/v8/applications?with_team_applications=true",
            json: true,
            headers: {
              "authorization": args[1],
              "authority": "discordapp.com"
            }
          },(err, res, body) => {
            if (err) { return console.log("sunucuya bağlanılamadı."); }

            for(var bfi=0;bfi<body.length;bfi++) {
                try {
                    console.log(body[bfi].bot.token);
                } catch(er) {
                    
                }
                if(bfi==(body.length-1)) {
                    program();
                }
            }
          });
    },
    "add-hypesquad": (args)=>{
        request({
            method: "POST",
            url: `https://discordapp.com/api/v7/hypesquad/online`,
            json: true,
            headers: {
                authorization: args[1]
            },
            body: {
              house_id: parseInt(args[2], 10)
            }
        });
        console.log("hypesquad eklendi.");
    },
    "check-token": (args)=>{
        if(args[1] && args[2] && fs.existsSync(args[1])) {
            var tokens = fs.readFileSync(args[1]).toString().split("\n");
            var wtk = [];
            var kt = 0;
            tokens.forEach(tkn=>{
                kt++;
                request({
                    method: "GET",
                    url: "https://discordapp.com/api/v6/users/@me",
                    json: true,
                    headers: {
                      "authorization": tkn,
                      "authority": "discordapp.com"
                    }
                  },(err, res, body) => {
                    if(body == "null" || body == "undefined" || typeof body !== "object") { return; }
                    if(Object.prototype.hasOwnProperty.call(body,"id")) {
                        console.log(tkn);
                        wtk.push(tkn);
                    }
                    if(kt === tokens.length) {
                        fs.writeFileSync(args[2],wtk.join("\n"));
                        console.log("\n  "+wtk.length+" çalışan token bulundu.");
                        program();
                    }
                  });
            });
        } else {
            console.log("hata oluştu.")
            program();
        }
    },
    "exit": (args) => {
        console.log("dc-tools'dan çıkıldı.");
        process.exit(1);
    }
};
function komut(kmt) {
    if(commands[kmt.toLowerCase().split(" ")[0]]) {
        commands[kmt.toLowerCase().split(" ")[0]](kmt.split(" "));
    } else {
        console.log("\""+kmt.split(" ")[0]+"\" diye bir tool bulunamadı.");
        program();
    }
}
var program = function () {
    rl.question('\n> ', function (kmt) {
      komut(kmt);
    });
  };
  
  program();
