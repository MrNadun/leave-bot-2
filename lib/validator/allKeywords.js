"use strict";
const fs = require('fs')
const chalk = require('chalk')

module.exports = [{
 chats: [ '@s.whatsapp.net', '@g.us' ],
 rules: `
${["1"] + ["."] + ["[❗]"] + [" Don't spam bot "]}
${["2"] + ["."] + ["[❗]"] + [" Bot is equipped with anti-call/phone"] + ["\n"] + [" "] + ["Phone = Block! "]}
${["3"] + ["."] + ["[❗]"] + [" Bot is not always online,"] + ["\n"] + [" "] + ["depends on the owner "]}
${["4"] + ["."] + ["[❗]"] + [" Don't forget to donate, bro, "] + ["\n"] + [" "] + ["Online bots also need a quota "]}
${["5"] + ["."] + ["[❗]"] + [" If you find a bug, please report it"] + ["\n"] + [" "] + ["by typing "] + ["[ "] + ["*"] + ["#"] + ["bug "] + ["_complaint_"] + ["*"] + [" ]"]}
${["6"] + ["."] + ["[❗]"] + [" We strictly prohibit spam!"]}
`,
 message: [ 
         '[ *[❗]CHAT FORWARDED[❗]* ]',
'Group Only!',
'Owner Only!',
'Admin Only!',
'Bot not Admin!',
         '「▰▰▰▰▰▰▰▰▰▰」Success✓!',
         '```「▰▰▱▱▱▱▱▱▱▱」Loading...```',
         '```「▰▰▰▰▰▰▰▰▱▱」Sending...```',
         "Masukan nomer target",
       ],
 mode: [
      '[ PUBLIC - MODE ]',
      '[ SELF - MODE ]'
    ],
cmd: [ 
      '\x1b[1;34m~\x1b[1;37m>', 
      '[\x1b[1;33mCMD\x1b[1;37m]'
   ],    
}]

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.yellow(`New ${__filename}`))
	delete require.cache[file]
	require(file)
})
