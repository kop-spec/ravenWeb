// =========================
// Horse Bet
// Part 2.1
// =========================
import { 
    db,
    testFirebase,
    collection,
    addDoc,
    getDocs
} from "./firebase.js";
console.log(db);
testFirebase();

let players = [];
let bets = [];

async function loadPlayers(){

    const querySnapshot = await getDocs(
        collection(db,"players")
    );


    players = [];


    querySnapshot.forEach((doc)=>{

        players.push(
            doc.data().name
        );

    });


    refreshPlayerSelect();


    console.log("โหลดผู้เล่น:",players);

}

//----------------------------
// เพิ่มผู้เล่น
//----------------------------

document
.getElementById("addPlayerBtn")
.addEventListener("click", addPlayer);

async function addPlayer(){

    let input=document.getElementById("playerName");

    let name=input.value.trim();

    if(name==""){

        alert("กรอกชื่อก่อน");

        return;

    }

    if(players.includes(name)){

        alert("ชื่อนี้มีแล้ว");

        return;

    }

    await addDoc(
        collection(db,"players"),
        {
            name:name,
            createdAt:new Date()
        }
    );
    
    
    players.push(name);
    
    input.value="";
    
    refreshPlayerSelect();
}

//----------------------------
// อัปเดตรายชื่อ
//----------------------------

function refreshPlayerSelect(){

    let ids=[

        "winPlayer",

        "lastPlayer",

        "stepPlayer"

    ];

    ids.forEach(id=>{

        let select=document.getElementById(id);

        select.innerHTML="";

        players.forEach(player=>{

            let option=document.createElement("option");

            option.value=player;

            option.textContent=player;

            select.appendChild(option);

        });

    });

}

//----------------------------
// แทงผู้ชนะ
//----------------------------

document
.getElementById("addWinBet")
.addEventListener("click",addWinBet);

function addWinBet(){

    if(players.length==0){

        alert("ยังไม่มีผู้เล่น");

        return;

    }

    let player=document.getElementById("winPlayer").value;

    let horse=document.getElementById("winHorse").value;

    bets.push({

        player,

        type:"ผู้ชนะ",

        bet:horse,

        amount:500,

        reward:0,

        win:false

    });

    refreshTable();

}

//----------------------------
// ตารางโพย
//----------------------------

function refreshTable(){

    let table=document.getElementById("betTable");

    table.innerHTML="";

    if(bets.length==0){

        table.innerHTML=`

        <tr>

        <td colspan="5">

        ยังไม่มีโพย

        </td>

        </tr>

        `;

        return;

    }

    bets.forEach((b,index)=>{

        table.innerHTML+=`

            <tr>

            <td>${b.player}</td>

            <td>${b.type}</td>

            <td>${b.bet}</td>

            <td>${b.amount}</td>

            <td>

            ${

            b.win

            ?

            "✅ "+b.reward

            :

            "❌"

            }

            </td>

            <td>

            <button onclick="deleteBet(${index})">

            🗑️

            </button>

            </td>

            </tr>

            `;

                });

}
// =========================
// แทงหัว-ท้าย
// Part 2.2
// =========================

// ปุ่มเพิ่มโพยหัว-ท้าย
document
.getElementById("addLastBet")
.addEventListener("click", addHeadTailBet);

function addHeadTailBet(){

    if(players.length===0){

        alert("ยังไม่มีผู้เล่น");

        return;

    }

    const player=document.getElementById("lastPlayer").value;

    const last=document.getElementById("tailHorse").value;


    bets.push({

        player:player,

        type:"ท้าย",

        bet:last,

        amount:500,

        reward:0,

        win:false

    });

    refreshTable();

}
// =========================
// แทงสเตป
// Part 2.3
// =========================

document
.getElementById("addStep")
.addEventListener("click", addStepBet);

function addStepBet(){

    if(players.length===0){

        alert("ยังไม่มีผู้เล่น");

        return;

    }

    const player=document.getElementById("stepPlayer").value;

    const s1=document.getElementById("step1").value;
    const s2=document.getElementById("step2").value;
    const s3=document.getElementById("step3").value;
    const s4=document.getElementById("step4").value;

    // ตรวจว่าซ้ำหรือไม่
    const arr=[s1,s2,s3,s4];

    const unique=new Set(arr);

    if(unique.size!==4){

        alert("ม้าห้ามซ้ำกัน");

        return;

    }

    bets.push({

        player:player,

        type:"สเตป",

        bet:s1+"-"+s2+"-"+s3+"-"+s4,

        amount:100,

        reward:0,

        win:false

    });

    refreshTable();

}

// =========================
// ลบโพย
// =========================

function deleteBet(index){

    if(!confirm("ลบโพยนี้ ?")){

        return;

    }

    bets.splice(index,1);

    refreshTable();

}

// =========================
// Part 3.1
// คำนวณผลการแข่งขัน
// =========================

document
.getElementById("calculateBtn")
.addEventListener("click", calculateResult);

async function calculateResult(){

    // อ่านผลการแข่งขัน
    const first = document.getElementById("result1").value;
    const second = document.getElementById("result2").value;
    const third = document.getElementById("result3").value;
    const fourth = document.getElementById("result4").value;

    // ตรวจว่าซ้ำหรือไม่
    const arr = [first, second, third, fourth];

    const unique = new Set(arr);

    if(unique.size !== 4){

        alert("ผลการแข่งขันห้ามมีม้าซ้ำ");

        return;

    }

    // เก็บผลไว้ใช้งาน
    const result = {

        first:first,
        second:second,
        third:third,
        fourth:fourth

    };

    console.log(result);

    checkWinner(result);

    await saveHistory(result);
    
    refreshTable();
    
    refreshSummary();

}

// =========================
// ตรวจผู้ชนะ
// Part 3.2
// =========================

function checkWinner(result){

    bets.forEach(b=>{

        // รีเซ็ตผลก่อนคำนวณใหม่
        b.win = false;
        b.reward = 0;

        // ------------------------
        // แทงผู้ชนะ
        // ------------------------
        if(b.type==="ผู้ชนะ"){

            if(b.bet === result.first){

                b.win = true;
                b.reward = b.amount * 2;

            }

        }

        // ------------------------
        // แทงหัว-ท้าย
        // ------------------------
        else if(b.type==="ท้าย"){

            if(b.bet === result.fourth){
        
                b.win = true;
                b.reward = b.amount * 2;
        
            }
        
        }

        // ------------------------
        // แทงสเตป
        // ------------------------
        else if(b.type==="สเตป"){

            const bet = b.bet.split("-");

            if(

                bet[0] === result.first &&
                bet[1] === result.second &&
                bet[2] === result.third &&
                bet[3] === result.fourth

            ){

                b.win = true;
                b.reward = b.amount * 30;

            }

        }

    });

}

// =========================
// ตารางคะแนน
// Part 3.5
// =========================

function refreshSummary(){

    const table=document.getElementById("summaryTable");

    table.innerHTML="";

    if(players.length===0){

        table.innerHTML=`

        <tr>

            <td colspan="3">

                ไม่มีผู้เล่น

            </td>

        </tr>

        `;

        return;

    }

    players.forEach(player=>{


        let playerBets = bets.filter(
            b=>b.player===player
        );
    
    
        // ไม่มีเดิมพัน ไม่ต้องแสดง
        if(playerBets.length===0){
    
            return;
    
        }
    
    
        let totalBet=0;
    
        let totalReward=0;
    
    
    
        playerBets.forEach(b=>{
    
            totalBet += b.amount;
    
            totalReward += b.reward;
    
        });
    
    
    
        table.innerHTML += `
    
        <tr>
    
            <td>${player}</td>
    
    
            <td>${totalBet}</td>
    
    
            <td style="color:${totalReward>0?'lime':'white'}">
    
                ${totalReward}
    
            </td>
    
    
        </tr>
    
        `;
    
    
    });

}

async function saveHistory(result){


    try{


        await addDoc(

            collection(db,"races"),

            {

                result:result,

                bets:bets,

                date:new Date()

            }

        );


        console.log("บันทึกประวัติการแข่งขันแล้ว");


    }
    catch(err){

        console.error(
            "บันทึกไม่สำเร็จ",
            err
        );

    }


}

loadPlayers();

