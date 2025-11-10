const SETTING = require('../setting');
const keywords = require('../lib/validator/allKeywords')

const modul = SETTING['modul'];
const getreq = SETTING['file'];

// Module imports from settings
const chalk = modul['chalk'];
const fs = modul['fs'];
const util = modul['util'];
const https = modul['https'];
const axios = modul['axios'];
const ytsr = modul['ytsr'];
const { spawn, exec, execSync } = modul['child'];
const { downloadContentFromMessage, WA_DEFAULT_EPHEMERAL, getLastMessageInChat, MessageType, generateWAMessageFromContent, prepareWAMessageMedia, proto } = modul['baileys'];
const moment = modul['time'];
const time = moment.tz('Asia/Colombo').format('DD/MM HH:mm:ss')
const speed = modul['speed'];
const request = modul['request'];
const path = modul['path'];
const ms = modul['premium'];
const cheerio = require('cheerio');
const FormData = require('form-data');
const { fromBuffer } = require('file-type');

// Local modules
const _prem = require('.' + getreq['prem']);
const { isLimit, limitAdd, getLimit, giveLimit, addBalance, kurangBalance, getBalance, isGame, gameAdd, givegame, cekGLimit } = require('.' + getreq['limit']);
const { color, bgcolor, ConsoleLog, biocolor } = require('.' + getreq['color']);
const { formatSize, sleep, readTime, reSize, runtime, getBuffer, getRandom, pickRandom, fetchJson, isUrl, genMath, formatp } = require('.' + getreq['funct']);
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid, writeExif, writeExifStc } = require('.' + getreq['exif']);

// Scraper
const { upload } = require('../lib/scrape/uploader.js');

// DB loads (ensure default if not found)
function readJSONSafely(file, fallback = []) {
  try {
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback
  } catch (e) { return fallback }
}
var balance = readJSONSafely('./nexaDB/balance.json', {});
var limit = readJSONSafely('./nexaDB/limit.json', {});
var glimit = readJSONSafely('./nexaDB/glimit.json', {});
var premium = readJSONSafely('./nexaDB/premium.json', []);
var pendaftar = readJSONSafely('./nexaDB/user.json', []);
const db_api = readJSONSafely('./nexaDB/api.json', {});
const afk = require("../lib/afk");
let _afk = readJSONSafely("./nexaDB/afk.json", []);

// Main Exported Function
module.exports = async (m, conn, from, store) => {
  // Context and Message Extract
  const isGroup = from.endsWith(keywords[0]['chats'][1]);
  const isGrouP = from.endsWith('@g.us');
  const sender = isGrouP ? (m.key.participant || m.participant) : m.key.remoteJid;
  const pushname = m.pushName || "No Name";
  const CMD = (m.xtype === 'conversation' && m.message.conversation) ? m.message.conversation : (m.xtype === 'imageMessage' && m.message.imageMessage.caption) ? m.message.imageMessage.caption : (m.xtype === 'videoMessage' && m.message.videoMessage.caption) ? m.message.videoMessage.caption : '';
  const prefixMatch = CMD && CMD.match(/^[#!.,®©¥€¢£/\∆✓]/)
  const prefix = prefixMatch ? prefixMatch[0] : '#';
  global.prefix = prefix;
  const chatmessage = (m.xtype === 'conversation' && m.message.conversation) ? m.message.conversation : (m.xtype === 'imageMessage') ? m.message.imageMessage.caption : (m.xtype === 'videoMessage') ? m.message.videoMessage.caption : '';
  const ordermessage = chatmessage
  const chats = chatmessage
  const args = (ordermessage || '').trim().split(/ +/).slice(1)
  const order = (ordermessage || '').trim().split(/ +/).shift().toLowerCase()
  const isCmd = ordermessage ? ordermessage.startsWith(prefix) : false
  const command = isCmd ? ordermessage.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
  const text = args.join(' ')
  const q = text
  const fatkuns = (m.quoted || m)
  // Quoted message type handler (can improve as per structure)
  const quoted = fatkuns
  const content = JSON.stringify(m.message)
  const orderPlugins = isCmd ? ordermessage.slice(1).trim().split(/ +/).shift().toLowerCase() : null
  const isChanel = from.endsWith('@newsletter')
  const botNumber = conn.user.id.split(':')[0] + keywords[0]['chats'][0]
  const mime = (quoted.mimetype || quoted?.mimetype) || ''
  const isMedia = /image|video|sticker|audio/.test(mime)
  const itulho = isGroup ? (m.key.participant || m.participant) : m.key.remoteJid
  const isOwner = [botNumber, ...global.ownerNumber].map(jid => jid.replace(/[^0-9]/g, '') + keywords[0]['chats'][0]).includes(itulho)
  let groupMetdata = isGroup ? await conn.groupMetadata(from) : null
  conn.groupMembers = isGroup ? groupMetdata?.participants ?? [] : []
  conn.groupName = isGroup ? groupMetdata?.subject ?? '' : ''
  conn.groupAdmins = isGroup ? conn.groupMembers.filter(v => v.admin).map(v => v.id) : []
  const isBotGroupAdmins = conn.groupAdmins.includes(botNumber)
  const isGroupAdmins = conn.groupAdmins.includes(m.sender)
  const isPremium = isOwner ? true : _prem.checkPremiumUser(sender, premium)
  const gcounti = SETTING.gcount
  const gcount = isPremium ? gcounti.prem : gcounti.user
  const limitCount = SETTING.limitCount
  const isUser = pendaftar.includes(sender)
  const isAfkOn = afk.checkAfkUser(m.sender, _afk)
  _prem.expiredCheck(conn, premium)
  const mentionByTag = m.xtype === "extendedTextMessage" && m.message.extendedTextMessage.contextInfo?.mentionedJid || []
  const mentionByreply = m.xtype === "extendedTextMessage" && m.message.extendedTextMessage.contextInfo?.participant || ""
  const mention = Array.isArray(mentionByTag) ? mentionByTag : [mentionByTag]
  if (mentionByreply) mention.push(mentionByreply)
  const mentionUser = mention.filter(n => n)
  const today = moment().tz("Asia/Colombo")
  const day = today.format('dddd')
  const datee = today.format('D')
  const month = today.format('MMMM')
  const year = today.format('YYYY')

  // Helper functions
  const reply = (text) => m.reply(text);
  const example = (text) => `Example: ${text}`;
  const mess = {
    group: '❌ This command can only be used in groups!',
    admin: '❌ This command can only be used by admins!',
    botAdmin: '❌ Bot must be an admin to use this command!',
    owner: '❌ This command can only be used by the owner!'
  };
  const author = SETTING.author || global.ownername;
  const filename = global.filename || 'Miss Nexa';
  const footer = global.footer || 'Powered by Nexa';
  const isconnSilence = isOwner || isGroupAdmins;

  // Helper: Contact object for display
  const contact = {
    key: {
      fromMe: false,
      participant: "0@s.whatsapp.net",
      ...(from ? { remoteJid: "status@broadcast" } : {})
    },
    message: {
      contactMessage: {
        displayName: `${m.sayingtime ?? ''}${m.timoji ?? ''}\n☏User: ${pushname}`,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nitem1.TEL;waid=${sender.split("@")[0]}:+${sender.split("@")[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
      }
    }
  }

  // AFK Functionality
  if (m.isGroup) {
    let mentionUsers = [...new Set([...(m.mentionedJid ?? []), ...(m.quoted ? [m.quoted.sender] : [])])]
    for (let ment of mentionUsers) {
      if (afk.checkAfkUser(ment, _afk)) {
        let getId2 = afk.getAfkId(ment, _afk)
        let getReason2 = afk.getAfkReason(getId2, _afk)
        let getTime = Date.now() - afk.getAfkTime(getId2, _afk)
        let heheh2 = await readTime(getTime)
        m.reply(` *[ ⛔ WARNING ⛔ ]*\n\n📝 *Note:* Don't tag him, he's currently afk\n💡 *Reason*: ${getReason2}\n🕛 *During*: ${heheh2.hours} hours, ${heheh2.minutes} minutes, ${heheh2.seconds} seconds ago`)
      }
    }
    if (afk.checkAfkUser(m.sender, _afk)) {
      let getId = afk.getAfkId(m.sender, _afk)
      let getReason = afk.getAfkReason(getId, _afk)
      let getTime = Date.now() - afk.getAfkTime(getId, _afk)
      let heheh = await readTime(getTime)
      _afk.splice(afk.getAfkPosition(m.sender, _afk), 1)
      fs.writeFileSync('./nexaDB/afk.json', JSON.stringify(_afk, null, 2))
      conn.sendTextWithMentions(m.chat,`*[ 👑 BACK FROM AFK 👑 ]*\n\n👤 *User* : @${m.sender.split('@')[0]}\n💡 *Reason* : ${getReason}\n🕛 *During* : ${heheh.hours} hours, ${heheh.minutes} minutes, ${heheh.seconds} seconds ago`, m)
    }
  }

  // Owner command: quick eval/exec
  if (chatmessage.startsWith('<')) {
    if (!isOwner) return m.reply('Enter Parameter Code!')
    let kode = chatmessage.trim().split(/ +/)[0]
    let teks
    try {
      teks = await eval(`(async () => { ${kode == ">>" ? "return" : ""} ${q}})()`)
    } catch (e) {
      teks = e
    } finally {
      await m.reply(require('util').format(teks))
    }
  }
  if (chatmessage.startsWith('=>')) {
    if (!isOwner) return
    try {
      m.reply(util.format(eval(`(async () => { ${chatmessage.slice(3)} })()`)))
    } catch (e) {
      m.reply(String(e))
    }
  }
  if (chatmessage.startsWith('>')) {
    if (!isOwner) return
    try {
      let evaled = await eval(chatmessage.slice(2))
      if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
      await m.reply(evaled)
    } catch (err) {
      m.reply(String(err))
    }
  }
  if (chatmessage.startsWith('$')) {
    if (!isOwner) return
    exec(chatmessage.slice(2), (err, stdout) => {
      if(err) return conn.sendMessage(from, {text: String(err)}, {quoted: m})
      if (stdout) return m.reply(stdout)
    })
  }

  // Register users automatically (only DM/private, not group)
  if (m.message && m.text && !isUser && !isGroup) {
    pendaftar.push(sender)
    fs.writeFileSync('./nexaDB/user.json', JSON.stringify(pendaftar, null, 2))
  }

  // Only-GC (can enable on demand)
  const onlygc = () => {
    conn.sendMessage(m.chat, {
      text: `_Halo ${pushname}_`,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true, 
          title: ` 🚫`,
          body: "Only In Group Chat",
          thumbnailUrl: "https://endpoint.web.id/server/file/Zy853r7VXWBRHTnM.jpg",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    })
  }

  // Uncomment for only-GC behavior
  /*
  if (order) {
    if (!isOwner && !m.isGroup && !m.isChanel) return onlygc();
  }
  */

  // Log commands with context
  if (m.message) {
    if (isCmd && !m.isGroup) {
      console.log(chalk.white(`===================================================
📆 DATE: ${new Date().toLocaleString()}
💭 MESSAGE : ${m.body || m.mtype}
👤️ FROM : ${pushname}
🔖 USER JID : ${m.sender}`));
    } else if (isCmd && m.isGroup) {
      console.log(chalk.white(`===================================================
📆 DATE: ${new Date().toLocaleString()}
💭 MESSAGE : ${m.body || m.mtype}
👤️ FROM : ${pushname}
🔖 USER JID : ${m.sender}
💡 LOCATION : ${conn.groupName}`));
    }
  }

  // Antilink config
  let antilinkStatus = false;
  const antilinkFile = './nexaDB/antilink.json'
  const saveAntilinkStatus = () => {
    fs.writeFileSync(antilinkFile, JSON.stringify({ status: antilinkStatus }, null, 2));
  };
  const loadAntilinkStatus = () => {
    if (fs.existsSync(antilinkFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(antilinkFile))
        antilinkStatus = data.status
      } catch (err) { }
    }
  }
  loadAntilinkStatus();

  // Leave DB paths
  const leaveDBPath = path.join(__dirname, "../nexaDB", "leave.json");
  const leaveDir = path.dirname(leaveDBPath);

  // Ensure directory
  if (!fs.existsSync(leaveDir)) {
    fs.mkdirSync(leaveDir, { recursive: true });
    console.log("Created 'nexaDB' folder.");
  }

  // === Leave Database Loader ===
  function loadLeaveDB() {
    const defaultDB = { fullLeaves: [], halfLeaves: [] };
    if (!fs.existsSync(leaveDBPath)) {
      fs.writeFileSync(leaveDBPath, JSON.stringify(defaultDB, null, 2));
      console.log("Initialized new leave.json file.");
      return defaultDB;
    }
    try {
      const parsed = JSON.parse(fs.readFileSync(leaveDBPath, "utf8"));
      return {
        fullLeaves: Array.isArray(parsed.fullLeaves) ? parsed.fullLeaves : [],
        halfLeaves: Array.isArray(parsed.halfLeaves) ? parsed.halfLeaves : []
      }
    } catch (err) {
      console.error("Invalid JSON in leave.json. Reinitializing...");
      fs.writeFileSync(leaveDBPath, JSON.stringify(defaultDB, null, 2));
      return defaultDB
    }
  }

  function saveLeaveDB(db) {
    try {
      fs.writeFileSync(leaveDBPath, JSON.stringify(db, null, 2));
      console.log("Database saved successfully.");
    } catch (err) {
      console.error("Error saving database:", err);
    }
  }

  // Helper: Next N Dates (for leave button)
  function generateNextDates(count = 14) {
    const now = new Date();
    const dates = [];
    for (let i = 0; i < count; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dateStr = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
      dates.push(dateStr);
    }
    return dates;
  }

  // ===================== COMMAND HANDLER =======================
  switch (command) {
    case 'menu1':
    case 'menuall':
    case 'allmenu':
    {
      conn.sendMessage(m.chat, {
        document: fs.readFileSync('./connection/nexa.txt'),
        fileName: 'yurii-md.jpg',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        caption: 'Halo! Ini yurii-md menu ✨',
        contextInfo: {
          externalAdReply: {
            title: '𝑩𝒂𝒔𝒆𝒅 𝑶𝒏 𝑬𝒔𝒎 𝑴𝒐𝒅𝒖𝒍𝒆',
            body: time,
            thumbnailUrl: 'https://img1.pixhost.to/images/9296/649396846_lily.jpg',
            mediaType: 1,
            renderLargerThumbnail: false
          }
        },
        footer: '@BasedByFallzx',
        buttons: [
          {
            buttonId: ".listmenu",
            buttonText: { displayText: 'List Feature' }
          },
          {
            buttonId: ".owner",
            buttonText: { displayText: 'Creator' }
          }
        ],
        viewOnce: true,
        headerType: 1
      }, { quoted: m, ephemeralExpiration: 86400 });
      break;
    }
    case 'menu':
    {
      let help =
`👋 𝙷𝚎𝚕𝚕𝚘 *${pushname}.* Welcome to the Leave Management Bot! 🙂\n> ❮ 𝙷𝚘𝚠 𝚝𝚘 𝚞𝚜𝚎 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜 ❯          \n\n
╭──☉ ❮ 𝙇𝙀𝘼𝙑𝙀 𝘾𝙊𝙈𝙈𝘼𝙉𝘿𝙎 ❯
│┬🍀 ${prefix}leave (or ${prefix}l)
│╰╴╴✪ Request a full day leave
│┬🍀 ${prefix}halfleave (or ${prefix}hl)
│╰╴╴✪ Request a half day leave
│┬🍀 ${prefix}leavelogs (or ${prefix}ll)
│╰╴╴✪ View all leave requests
╰─────────────☉

╭──☉ ❮ 𝘼𝘿𝙈𝙄𝙉 𝘾𝙊𝙈𝙈𝘼𝙉𝘿𝙎 ❯
│┬🔑 ${prefix}approve
│╰╴╴✪ Approve pending leave request
│┬🔑 ${prefix}reject
│╰╴╴✪ Reject pending leave request
│┬🔑 ${prefix}tagall
│╰╴╴✪ Tag all group members
╰─────────────☉

📌 *Note:* Commands work with or without prefix (${prefix})
🌐 *Web Dashboard:* Access via the URL in Replit`;
      conn.sendMessage(m.chat, {
        document: fs.readFileSync('./connection/nexa.txt'),
        fileName: filename,
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        caption: help,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: {
            title: "Leave Bot Menu",
            body: time,
            thumbnailUrl: "https://i.postimg.cc/tRwM184K/Whats-App-Image-2025-11-10-at-4-20-03-PM.jpg",
            mediaType: 1,
            renderLargerThumbnail: true
          }
        },
        footer: footer,
        buttons: [{
          name: "cta_url",
          buttonParamsJson: `{\"display_text\":\"github\",\"url\":\"https://github.com\",\"merchant_url\":\"https://www.google.com\"}`
        }],
        viewOnce: true,
        headerType: 1
      }, { quoted: m, ephemeralExpiration: 86400 });
      break;
    }
    case 'leave':
    case 'l':
    {
      const now = new Date();
      const dateRows = generateNextDates(14).map(dateStr => ({
        title: `📅 ${dateStr}`,
        id: `gl ${dateStr}`
      }));

      let requestLeave = `🤓 Hey *${pushname}*, Do you want a leave?\n📅 Choose the day you want a Leave.`;

      const leaveSelect = {
        buttonId: "action",
        buttonText: { displayText: "📅 Click Here" },
        type: 4,
        nativeFlowInfo: {
          name: "single_select",
          paramsJson: JSON.stringify({
            title: "📅 Click Here",
            sections: [{ title: "🙂 Select Your Leave 👇", rows: dateRows }]
          }),
        }
      };

      conn.sendMessage(m.chat, {
        document: fs.readFileSync('././connection/nexa.txt'),
        fileName: filename,
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        caption: requestLeave,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: {
            title: "Request Leave",
            body: time,
            thumbnailUrl: "https://img1.pixhost.to/images/9296/649396846_lily.jpg",
            mediaType: 1,
            renderLargerThumbnail: true
          }
        },
        footer: footer,
        buttons: [
          {
            buttonId: `.owner`,
            buttonText: { displayText: "❮ 👤Owner ❯" },
            type: 1,
          },
          {
            buttonId: `.menu`,
            buttonText: { displayText: "❮ 📜Menu ❯" },
            type: 1,
          },
          leaveSelect
        ],
        viewOnce: true,
        headerType: 1
      }, { quoted: m, ephemeralExpiration: 86400 });
      break;
    }
    case 'gl':  
    {
      let leaveDate = text
      
      // Generate unique ID FIRST
      const leaveId = `LEAVE_${Date.now()}_${m.sender.split('@')[0]}`;
      
      let giveLeave = `📅 *A Leave Request* 📅\n
╔══❮ Leave Info ❯
║👤 User :- ${pushname}
║📝 Leave Date :- *${leaveDate}*
║⏰ Requested Time :- ${new Date().toLocaleString()}
╚═════════════○

> Dear ${pushname}, Your leave is currently pending. Please wait until it is approved or rejected.`;
      let sentMsg = await conn.sendMessage(m.chat, {
        document: fs.readFileSync('./connection/nexa.txt'),
        fileName: filename,
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        caption: giveLeave,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: {
            title: "Leave Request",
            body: time,
            thumbnailUrl: "https://img1.pixhost.to/images/9296/649396846_lily.jpg",
            mediaType: 1,
            renderLargerThumbnail: true
          }
        },
        footer: footer,
        buttons: [
          { buttonId: `.approve ${leaveId}`, buttonText: { displayText: '❮ ✅ Approve ❯' }, type: 1 },
          { buttonId: `.reject ${leaveId}`, buttonText: { displayText: '❮ ❌ Reject ❯' }, type: 1 }
        ],
        viewOnce: true,
        headerType: 1
      }, { quoted: m, ephemeralExpiration: 86400 });
      
      // Save to database with unique ID
      let db = loadLeaveDB();
      db.fullLeaves.push({
        id: leaveId,
        user: m.sender,
        name: pushname,
        date: leaveDate,
        status: "pending",
        requestedAt: new Date().toISOString(),
        messageKey: sentMsg.key,
        chatId: m.chat
      });
      saveLeaveDB(db);
      
      // Send notification to admins
      const adminNumbers = global.admins || [];
      for (let adminNum of adminNumbers) {
        const adminJid = adminNum + '@s.whatsapp.net';
        try {
          await conn.sendMessage(adminJid, {
            text: `📩 *New Leave Request*\n\n👤 From: ${pushname}\n📅 Date: ${leaveDate}\n⏰ Requested: ${new Date().toLocaleString()}\n\n💡 Reply with:\n• *${prefix}approve ${leaveId}* to approve\n• *${prefix}reject ${leaveId}* to reject`,
            mentions: [m.sender]
          });
        } catch (e) {
          console.log(`Could not notify admin ${adminNum}:`, e.message);
        }
      }
      
      m.reply(`✅ Leave request submitted successfully!\n📅 Date: ${leaveDate}\n⏳ Status: Pending approval`);
      break;
    }
    
    case 'approve':
    {
      let senderNumber = m.sender.split("@")[0];
      if (!(global.admins && global.admins.includes(senderNumber))) {
        return m.reply("❌ Sorry, you are not authorized to approve leave requests.");
      }
      
      // Get leave ID from command argument
      const leaveId = args[0];
      if (!leaveId) {
        // Show all pending leaves
        let db = loadLeaveDB();
        let pending = db.fullLeaves.filter(l => l.status === "pending");
        if (pending.length === 0) {
          return m.reply("❌ No pending leave requests found.");
        }
        let list = pending.map((l, i) => 
          `${i + 1}. ${l.name}\n   📅 Date: ${l.date}\n   🆔 ID: ${l.id}`
        ).join('\n\n');
        return m.reply(`📋 *Pending Leave Requests:*\n\n${list}\n\n💡 Use: *${prefix}approve <ID>* to approve`);
      }
      
      try {
        let db = loadLeaveDB();
        let leaveIndex = db.fullLeaves.findIndex(leave => leave.id === leaveId && leave.status === "pending");
        
        if (leaveIndex === -1) {
          return m.reply("❌ Leave request not found or already processed.");
        }
        
        let leave = db.fullLeaves[leaveIndex];
        
        // Update database
        db.fullLeaves[leaveIndex].status = "approved";
        db.fullLeaves[leaveIndex].approvedBy = m.sender;
        db.fullLeaves[leaveIndex].approvedAt = new Date().toISOString();
        saveLeaveDB(db);
        
        // Delete original message if possible
        try {
          if (leave.messageKey && leave.chatId) {
            await conn.sendMessage(leave.chatId, { delete: leave.messageKey });
          }
        } catch (e) {
          console.log("Could not delete original message:", e.message);
        }
        
        // Notify in group/chat
        await conn.sendMessage(m.chat, {
          text: `✅ Leave request *APPROVED* by admin! 🎉\n\n👤 User: @${leave.user.split("@")[0]}\n📅 Date: ${leave.date}\n⏰ Approved: ${new Date().toLocaleString()}`,
          mentions: [leave.user],
        });
        
        // Notify user
        await conn.sendMessage(leave.user, {
          text: `🎉 Hello *${leave.name}*!\n\nYour leave request has been *APPROVED*! ✅\n📅 Date: ${leave.date}\n\nEnjoy your time off! 😎`,
        });
        
        m.reply("✅ Leave approved successfully!");
      } catch (err) {
        console.error("Error approving leave:", err);
        m.reply("❌ Failed to process approval. Please try again.\n" + err.message);
      }
      break;
    }
    
    case 'reject':
    {
      let senderNumber = m.sender.split("@")[0];
      if (!(global.admins && global.admins.includes(senderNumber))) {
        return m.reply("❌ Sorry, you are not authorized to reject leave requests.");
      }
      
      // Get leave ID from command argument
      const leaveId = args[0];
      if (!leaveId) {
        // Show all pending leaves
        let db = loadLeaveDB();
        let pending = db.fullLeaves.filter(l => l.status === "pending");
        if (pending.length === 0) {
          return m.reply("❌ No pending leave requests found.");
        }
        let list = pending.map((l, i) => 
          `${i + 1}. ${l.name}\n   📅 Date: ${l.date}\n   🆔 ID: ${l.id}`
        ).join('\n\n');
        return m.reply(`📋 *Pending Leave Requests:*\n\n${list}\n\n💡 Use: *${prefix}reject <ID>* to reject`);
      }
      
      try {
        let db = loadLeaveDB();
        let leaveIndex = db.fullLeaves.findIndex(leave => leave.id === leaveId && leave.status === "pending");
        
        if (leaveIndex === -1) {
          return m.reply("❌ Leave request not found or already processed.");
        }
        
        let leave = db.fullLeaves[leaveIndex];
        
        // Update database
        db.fullLeaves[leaveIndex].status = "rejected";
        db.fullLeaves[leaveIndex].rejectedBy = m.sender;
        db.fullLeaves[leaveIndex].rejectedAt = new Date().toISOString();
        saveLeaveDB(db);
        
        // Delete original message if possible
        try {
          if (leave.messageKey && leave.chatId) {
            await conn.sendMessage(leave.chatId, { delete: leave.messageKey });
          }
        } catch (e) {
          console.log("Could not delete original message:", e.message);
        }
        
        // Notify in group/chat
        await conn.sendMessage(m.chat, {
          text: `❌ Leave request *REJECTED* by admin.\n\n👤 User: @${leave.user.split("@")[0]}\n📅 Date: ${leave.date}\n⏰ Rejected: ${new Date().toLocaleString()}`,
          mentions: [leave.user],
        });
        
        // Notify user
        await conn.sendMessage(leave.user, {
          text: `😞 Hello *${leave.name}*,\n\nYour leave request has been *REJECTED* by your manager.\n📅 Date: ${leave.date}\n\nPlease contact your manager for more information.`,
        });
        
        m.reply("✅ Leave rejected successfully!");
      } catch (err) {
        console.error("Error rejecting leave:", err);
        m.reply("❌ Failed to process rejection. Please try again.\n" + err.message);
      }
      break;
    }
    case 'halfleave':
    case 'hl':
    {
      let requestHalfLeave = `🕒 Hey *${pushname}.*\nDo you want a half leave? 😁 Choose your time.✨`;
      let timeSlots = ["08:00 AM - 13:00 PM", "13:00 PM - 18:00 PM"];
      let timeRows = timeSlots.map(time => ({
        title: `🕐 ${time}`,
        id: `.halfconfirm ${time}`
      }))
      const halfSelect = {
        buttonId: "action",
        buttonText: { displayText: "🕐 Select Time" },
        type: 4,
        nativeFlowInfo: {
          name: "single_select",
          paramsJson: JSON.stringify({
            title: "🕐 Select Your Half Leave Time",
            sections: [{ title: "🕘 Choose When You’ll Leave", rows: timeRows }]
          }),
        }
      };
      conn.sendMessage(m.chat, {
        document: fs.readFileSync('./connection/nexa.txt'),
        fileName: filename,
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        caption: requestHalfLeave,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: {
            title: "Half Leave Request",
            body: time,
            thumbnailUrl: "https://img1.pixhost.to/images/9296/649396846_lily.jpg",
            mediaType: 1,
            renderLargerThumbnail: true
          }
        },
        footer: footer,
        buttons: [
          {
            buttonId: `.owner`,
            buttonText: { displayText: "❮ 👤Owner ❯" },
            type: 1,
          },
          {
            buttonId: `.menu`,
            buttonText: { displayText: "❮ 📜Menu ❯" },
            type: 1,
          },
          halfSelect
        ],
        viewOnce: true,
        headerType: 1
      }, { quoted: m, ephemeralExpiration: 86400 });
      break;
    }
    case 'halfconfirm':
    {
      let timeStr = text.trim();
      
      // Generate unique ID FIRST
      const leaveId = `HALFLEAVE_${Date.now()}_${m.sender.split('@')[0]}`;
      let halfLeaveMessage = `
🕒 *Half Leave Request* 🕒

👤 User: ${pushname}
⏰ Time: *${timeStr}*
📅 Requested: ${new Date().toLocaleString()}

> Dear ${pushname}, your half-leave request is pending. Please wait until it’s approved or rejected.
`;
      let sentMsg = await conn.sendMessage(m.chat, {
        document: fs.readFileSync('./connection/nexa.txt'),
        fileName: filename,
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        caption: halfLeaveMessage,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: {
            title: "Half Leave Request",
            body: time,
            thumbnailUrl: "https://img1.pixhost.to/images/9296/649396846_lily.jpg",
            mediaType: 1,
            renderLargerThumbnail: true
          }
        },
        footer: footer,
        buttons: [
          { buttonId: `.approvehalf ${leaveId}`, buttonText: { displayText: "✅ Approve" }, type: 1 },
          { buttonId: `.rejecthalf ${leaveId}`, buttonText: { displayText: "❌ Reject" }, type: 1 }
        ],
        viewOnce: true,
        headerType: 1
      }, { quoted: m, ephemeralExpiration: 86400 });
      
      // Save to database
      let db = loadLeaveDB();
      db.halfLeaves.push({
        id: leaveId,
        user: m.sender,
        name: pushname,
        time: timeStr,
        status: "pending",
        requestedAt: new Date().toISOString(),
        messageKey: sentMsg.key,
        chatId: m.chat
      });
      saveLeaveDB(db);
      
      // Send notification to admins
      const adminNumbers = global.admins || [];
      for (let adminNum of adminNumbers) {
        const adminJid = adminNum + '@s.whatsapp.net';
        try {
          await conn.sendMessage(adminJid, {
            text: `📩 *New Half Leave Request*\n\n👤 From: ${pushname}\n⏰ Time: ${timeStr}\n📅 Requested: ${new Date().toLocaleString()}\n\n💡 Reply with:\n• *${prefix}approvehalf ${leaveId}* to approve\n• *${prefix}rejecthalf ${leaveId}* to reject`,
            mentions: [m.sender]
          });
        } catch (e) {
          console.log(`Could not notify admin ${adminNum}:`, e.message);
        }
      }
      
      m.reply(`✅ Half leave request submitted successfully!\n⏰ Time: ${timeStr}\n⏳ Status: Pending approval`);
      break;
    }
    
    case 'approvehalf':
    {
      let senderNumber = m.sender.split("@")[0];
      if (!(global.admins && global.admins.includes(senderNumber))) {
        return m.reply("❌ Sorry, you are not authorized to approve half-leaves.");
      }
      
      // Get leave ID from command argument
      const leaveId = args[0];
      if (!leaveId) {
        // Show all pending half leaves
        let db = loadLeaveDB();
        let pending = db.halfLeaves.filter(l => l.status === "pending");
        if (pending.length === 0) {
          return m.reply("❌ No pending half-leave requests found.");
        }
        let list = pending.map((l, i) => 
          `${i + 1}. ${l.name}\n   ⏰ Time: ${l.time}\n   🆔 ID: ${l.id}`
        ).join('\n\n');
        return m.reply(`📋 *Pending Half Leave Requests:*\n\n${list}\n\n💡 Use: *${prefix}approvehalf <ID>* to approve`);
      }
      
      try {
        let db = loadLeaveDB();
        let leaveIndex = db.halfLeaves.findIndex(leave => leave.id === leaveId && leave.status === "pending");
        
        if (leaveIndex === -1) {
          return m.reply("❌ Half leave request not found or already processed.");
        }
        
        let leave = db.halfLeaves[leaveIndex];
        
        // Update database
        db.halfLeaves[leaveIndex].status = "approved";
        db.halfLeaves[leaveIndex].approvedBy = m.sender;
        db.halfLeaves[leaveIndex].approvedAt = new Date().toISOString();
        saveLeaveDB(db);
        
        // Delete original message if possible
        try {
          if (leave.messageKey && leave.chatId) {
            await conn.sendMessage(leave.chatId, { delete: leave.messageKey });
          }
        } catch (e) {
          console.log("Could not delete original message:", e.message);
        }
        
        // Notify in group/chat
        await conn.sendMessage(m.chat, {
          text: `✅ Half leave request *APPROVED* by admin! 🎉\n\n👤 User: @${leave.user.split("@")[0]}\n⏰ Time: ${leave.time}\n📅 Approved: ${new Date().toLocaleString()}`,
          mentions: [leave.user],
        });
        
        // Notify user
        await conn.sendMessage(leave.user, {
          text: `🎉 Hello *${leave.name}*!\n\nYour half-leave request has been *APPROVED*! ✅\n⏰ Time: ${leave.time}\n\nEnjoy your time off! 😎`,
        });
        
        m.reply("✅ Half leave approved successfully!");
      } catch (err) {
        console.error("Error approving half leave:", err);
        m.reply("❌ Failed to process approval. Please try again.\n" + err.message);
      }
      break;
    }
    
    case 'rejecthalf':
    {
      let senderNumber = m.sender.split("@")[0];
      if (!(global.admins && global.admins.includes(senderNumber))) {
        return m.reply("❌ Sorry, you are not authorized to reject half-leaves.");
      }
      
      // Get leave ID from command argument
      const leaveId = args[0];
      if (!leaveId) {
        // Show all pending half leaves
        let db = loadLeaveDB();
        let pending = db.halfLeaves.filter(l => l.status === "pending");
        if (pending.length === 0) {
          return m.reply("❌ No pending half-leave requests found.");
        }
        let list = pending.map((l, i) => 
          `${i + 1}. ${l.name}\n   ⏰ Time: ${l.time}\n   🆔 ID: ${l.id}`
        ).join('\n\n');
        return m.reply(`📋 *Pending Half Leave Requests:*\n\n${list}\n\n💡 Use: *${prefix}rejecthalf <ID>* to reject`);
      }
      
      try {
        let db = loadLeaveDB();
        let leaveIndex = db.halfLeaves.findIndex(leave => leave.id === leaveId && leave.status === "pending");
        
        if (leaveIndex === -1) {
          return m.reply("❌ Half leave request not found or already processed.");
        }
        
        let leave = db.halfLeaves[leaveIndex];
        
        // Update database
        db.halfLeaves[leaveIndex].status = "rejected";
        db.halfLeaves[leaveIndex].rejectedBy = m.sender;
        db.halfLeaves[leaveIndex].rejectedAt = new Date().toISOString();
        saveLeaveDB(db);
        
        // Delete original message if possible
        try {
          if (leave.messageKey && leave.chatId) {
            await conn.sendMessage(leave.chatId, { delete: leave.messageKey });
          }
        } catch (e) {
          console.log("Could not delete original message:", e.message);
        }
        
        // Notify in group/chat
        await conn.sendMessage(m.chat, {
          text: `❌ Half leave request *REJECTED* by admin.\n\n👤 User: @${leave.user.split("@")[0]}\n⏰ Time: ${leave.time}\n📅 Rejected: ${new Date().toLocaleString()}`,
          mentions: [leave.user],
        });
        
        // Notify user
        await conn.sendMessage(leave.user, {
          text: `😞 Hello *${leave.name}*,\n\nYour half-leave request has been *REJECTED* by your manager.\n⏰ Time: ${leave.time}\n\nPlease contact your manager for more information.`,
        });
        
        m.reply("✅ Half leave rejected successfully!");
      } catch (err) {
        console.error("Error rejecting half leave:", err);
        m.reply("❌ Failed to process rejection. Please try again.\n" + err.message);
      }
      break;
    }
    case 'leavelogs':
    case 'll':
    {
      let senderNumber = m.sender.split("@")[0];
      if (!(global.admins && global.admins.includes(senderNumber)))
        return m.reply("❌ Sorry, you are not authorized.");
      let db = loadLeaveDB();
      let fullList = db.fullLeaves
        .map((x, i) => `📅 ${i + 1}. ${x.name}\nDate: ${x.date}\nStatus: ${x.status}`)
        .join("\n\n");
      let halfList = db.halfLeaves
        .map((x, i) => `🕐 ${i + 1}. ${x.name}\nTime: ${x.time}\nStatus: ${x.status}`)
        .join("\n\n");
      let msg = `📁 *BuyMore Leave Records*\n\n🌕 *Full Day Leaves:*\n${fullList || "_No full leaves_"}\n\n🌗 *Half Day Leaves:*\n${halfList || "_No half leaves_"}`;
      m.reply(msg);
      break;
    }
    
    case 'owner': {
    let vcard = `BEGIN:VCARD\nVERSION:3.0\nN:WhatsApp; ${global.ownerName}\nORG: ${global.ownerName}\nTITLE:soft\nitem1.TEL;waid=${global.owner}:${global.owner}\nitem1.X-ABLabel:Ponsel\nitem2.URL:https://github.com/MrNadun\nitem2.X-ABLabel:ðŸ’¬ More\nitem3.EMAIL;type=INTERNET: https://github.com/MrNadun\nitem3.X-ABLabel:Email\nitem4.ADR:;;srilanka;;;;\nitem4.X-ABADR:ðŸ’¬ More\nitem4.X-ABLabel:Lokasi\nEND:VCARD`;
const sentMsg = await conn.sendMessage(m.chat, {
      contacts: {
        displayName: author,
        contacts: [{ vcard }],
      },
      contextInfo: {
        externalAdReply: {
          title: "M R - N A D U N",
          body: "",
          thumbnailUrl: `https://img1.pixhost.to/images/5890/601642973_skyzopedia.jpg`,
          mediaType: 1,
          showAdAttribution: false,
          renderLargerThumbnail: true,
        }}}, { quoted: m });
    }
    break;
    
    case prefix + "public": {
      if (!conn.public) {
        try {
          if (fs.existsSync('./media/vn/lusiapa.mp3')) {
            return conn.sendMessage(from, {audio: fs.readFileSync('./media/vn/lusiapa.mp3'),mimetype: 'audio/mpeg',ptt: true},{quoted:m});
          }
        } catch (e) {}
      }
      conn.public = true;
      reply(`Successfully changed to ${command}`);
      break;
    }
    
    case prefix + "self":
    case prefix + "private": {
      if (conn.public) {
        try {
          if (fs.existsSync('./media/vn/lusiapa.mp3')) {
            return conn.sendMessage(from, {audio: fs.readFileSync('./media/vn/lusiapa.mp3'),mimetype: 'audio/mpeg',ptt: true},{quoted:m});
          }
        } catch (e) {}
      }
      conn.public = false;
      reply(`Successfully changed to ${command}`);
      break;
    }

    case 'tagall': {
      if (!isconnSilence) {
        try {
          if (fs.existsSync('./media/vn/lusiapa.mp3')) {
            return conn.sendMessage(from, {audio: fs.readFileSync('./media/vn/lusiapa.mp3'),mimetype: 'audio/mpeg',ptt: true},{quoted:m});
          }
        } catch (e) {}
      }
      if (!m.isGroup) return reply(mess.group);
      const textMessage = args.join(" ") || "nothing";
      let teks = `tagall message :\n> *${textMessage}*\n\n`;
      const groupMetadata = await conn.groupMetadata(m.chat);
      const participants = groupMetadata.participants;
      for (let mem of participants) {
        teks += `@${mem.id.split("@")[0]}\n`;
      }
      conn.sendMessage(m.chat, {
        text: teks,
        mentions: participants.map((a) => a.id)
      }, { quoted: m });
      break;
    }
    
    case prefix + "h":
    case prefix + "hidetag": {
      if (!m.isGroup) return reply(mess.group);
      if (!conn.public) {
        try {
          if (fs.existsSync('./media/vn/lusiapa.mp3')) {
            return conn.sendMessage(from, {audio: fs.readFileSync('./media/vn/lusiapa.mp3'),mimetype: 'audio/mpeg',ptt: true},{quoted:m});
          }
        } catch (e) {}
      }
      const groupMeta = await conn.groupMetadata(m.chat);
      const groupParticipants = groupMeta.participants;
      if (m.quoted) {
        conn.sendMessage(m.chat, {
          forward: m.quoted.fakeObj,
          mentions: groupParticipants.map(a => a.id)
        });
      } else {
        conn.sendMessage(m.chat, {
          text: q ? q : '',
          mentions: groupParticipants.map(a => a.id)
        }, { quoted: m });
      }
      break;
    }

    case prefix + "tourl": 
    case prefix + "tourl2": {
      if (!/image|video/.test(mime)) return m.reply(example("dengan reply foto/vidio"));
      
      async function dt (buffer) {
        const fetchModule = await import('node-fetch');
        const fetch = fetchModule.default;
        let { ext } = await fromBuffer(buffer);
        let bodyForm = new FormData();
        bodyForm.append("fileToUpload", buffer, "file." + ext);
        bodyForm.append("reqtype", "fileupload");
        let res = await fetch("https://catbox.moe/user/api.php", {
          method: "POST",
          body: bodyForm,
        });
        let data = await res.text();
        return data;
      }

      let aa = m.quoted ? await m.quoted.download() : await m.download();
      let dd = await dt(aa);
      await conn.sendMessage(m.chat, {text: `*Url :* ${dd}\n*Expired :* Permanen`}, {quoted: m});
      break;
    }
    
    default:
      break;
  }

  // Antilink check
  if (antilinkStatus) {
    let gc = `https://`
    if (chatmessage.includes(gc)) {
      m.reply('*sebuah link terdeteksi maaf kamu harus di kick ⛔*');
      let gclink = (`https://chat.whatsapp.com/` + await conn.groupInviteCode(m.chat))
      let isLinkThisGc = new RegExp(gclink, 'i')
      let isgclink = isLinkThisGc.test(m.text)
      if (isgclink) return m.reply(`Ohh, Link Group Ini Ternyata`)
      if (!isBotGroupAdmins) return m.reply(`Duhh bot bukan admin`)
      if (isGroupAdmins) return m.reply(`Ternyata kamu admin, maaf min`)
      if (isOwner) return m.reply(`Ternyata kamu owner, maaf king`)
      conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant
        }
      })
      conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
    }
  }
};

// === Hot reload the module on change in development ===
let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log('===================================================');
  console.log(chalk.red(`    New ${__filename}`))
  delete require.cache[file]
  require(file)
});
