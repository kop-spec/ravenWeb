// =========================
// Horse Bet
// Part 2.1
// =========================
import {
    db,
    testFirebase,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
} from "./firebase.js";
console.log(db);
testFirebase();

let players = [];
let bets = [];

// โหลดโพยที่ค้างไว้
const savedBets = localStorage.getItem("duckbet_bets");

if(savedBets){
    bets = JSON.parse(savedBets);
}

async function loadPlayers(){

    const querySnapshot = await getDocs(
        collection(db,"players")
    );


    players = [];


    querySnapshot.forEach((doc)=>{

        players.push({

            id:doc.id,
        
            name:doc.data().name
        
        });

    });


    refreshPlayerSelect();
    refreshPlayerTable();
    loadSelectedValues();


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
    
    
    players.push({

        name:name
    
    });
    
    input.value="";
    
    refreshPlayerSelect();
    loadSelectedValues();
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
        
        
            option.value=player.name;
        
        
            option.textContent=player.name;
        
        
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

    localStorage.setItem(
        "duckbet_bets",
        JSON.stringify(bets)
    );

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

    const table = document.getElementById("summaryTable");

    table.innerHTML = "";

    if(players.length === 0){

        table.innerHTML = `
        <tr>
            <td colspan="3">
                ไม่มีผู้เล่น
            </td>
        </tr>
        `;

        return;
    }

    players.forEach(player => {

        let playerBets = bets.filter(
            b => b.player === player.name
        );

        // ไม่มีเดิมพัน ไม่ต้องแสดง
        if(playerBets.length === 0){
            return;
        }

        let totalBet = 0;
        let totalGet = 0;

        playerBets.forEach(b => {

            totalBet += b.amount;

            if(b.win){
                totalGet += b.reward;
            }
            else{
                totalGet -= b.amount;
            }

        });

        table.innerHTML += `
        <tr>

            <td>
                ${player.name}
            </td>

            <td>
                ${totalBet}
            </td>

            <td style="color:${totalGet > 0 ? 'lime' : 'white'}">
                ${totalGet}
            </td>

        </tr>
        `;

    });

}

async function saveHistory(result){

    try{

        const snapshot = await getDocs(
            collection(db, "races")
        );

        const raceNumber = snapshot.size + 1;

        await addDoc(
            collection(db, "races"),
            {
                raceNumber: raceNumber,
                result: result,
                bets: bets,
                status: "finished",
                date: new Date()
            }
        );

        console.log(
            "บันทึก Race #" + raceNumber
        );

    }
    catch(err){

        console.error(
            "บันทึกไม่สำเร็จ",
            err
        );

    }

}

function refreshPlayerTable(){


    let table =
    document.getElementById(
        "playerTable"
    );


    if(!table)
        return;


    table.innerHTML="";



    players.forEach(player=>{


        table.innerHTML += `

        <tr>

        <td>
        ${player.name}
        </td>


        <td>


        <button
        onclick="deletePlayer('${player.id}')">

        🗑️ Delete

        </button>


        </td>


        </tr>


        `;


    });


}

window.deletePlayer = async function(id){


    if(!confirm(
        "ต้องการลบ Player นี้ไหม?"
    ))
    return;



    await deleteDoc(

        doc(
            db,
            "players",
            id
        )

    );


    alert(
        "ลบ Player แล้ว"
    );


    loadPlayers();

}

window.togglePlayerManage = function(){


    let box =
    document.getElementById(
        "playerManageBox"
    );


    if(box.style.display==="none"){

        box.style.display="block";

    }
    else{

        box.style.display="none";

    }


}

// =========================
// Result Race Dropdown
// =========================

const raceSelect = document.getElementById("raceSelect");

raceSelect.addEventListener("change", async function(){

    const raceId = this.value;

    const table = document.getElementById("summaryTable");

    table.innerHTML = "";

    if(!raceId){

        table.innerHTML = `
        <tr>
            <td colspan="3">
                เลือก Race
            </td>
        </tr>
        `;

        return;
    }

    try{

        const snapshot = await getDocs(
            collection(db,"races")
        );

        let selectedRace = null;

        snapshot.forEach(doc => {

            if(doc.id === raceId){

                selectedRace = doc.data();

            }

        });


        if(!selectedRace){

            table.innerHTML = `
            <tr>
                <td colspan="3">
                    ไม่พบข้อมูล Race
                </td>
            </tr>
            `;

            return;
        }


        // =========================
        // คำนวณผลของแต่ละคน
        // =========================

        let playersResult = {};


        selectedRace.bets.forEach(b => {

            if(!playersResult[b.player]){

                playersResult[b.player] = {
                    bet: 0,
                    get: 0
                };

            }


            playersResult[b.player].bet += b.amount;


            if(b.win){

                playersResult[b.player].get += b.reward;

            }
            else{

                playersResult[b.player].get -= b.amount;

            }

        });


        // =========================
        // แสดงผล
        // =========================

        Object.entries(playersResult).forEach(
            ([player,data]) => {

                table.innerHTML += `

                <tr>

                    <td>
                        ${player}
                    </td>

                    <td>
                        ${data.bet}
                    </td>

                    <td style="
                        color:${
                            data.get > 0
                            ? 'lime'
                            : data.get < 0
                            ? '#ff5252'
                            : 'white'
                        };
                        font-weight:bold;
                    ">
                        ${data.get}
                    </td>

                </tr>

                `;

            }
        );


    }
    catch(error){

        console.error(error);

    }

});


// =========================
// โหลด Race จาก Firebase
// =========================

async function loadRaceDropdown(){

    const select = document.getElementById("raceSelect");

    select.innerHTML = `
        <option value="">
            เลือก Race
        </option>
    `;


    try{

        const snapshot = await getDocs(
            collection(db,"races")
        );


        let races = [];


        snapshot.forEach(doc => {

            races.push({

                id: doc.id,

                data: doc.data()

            });

        });


        // Race ล่าสุดก่อน
        races.forEach(race => {

            const option =
                document.createElement("option");
        
            option.value = race.id;
        
            option.textContent =
                `Race #${race.data.raceNumber}`;
        
            select.appendChild(option);
        
        });


    }
    catch(error){

        console.error(
            "โหลด Race ไม่สำเร็จ",
            error
        );

    }

}

// =========================
// จำค่าที่เลือกหลัง Refresh
// =========================

const selectIds = [
    "winPlayer",
    "winHorse",
    "lastPlayer",
    "tailHorse",
    "stepPlayer",
    "step1",
    "step2",
    "step3",
    "step4",
    "result1",
    "result2",
    "result3",
    "result4"
];


// โหลดค่าที่เคยเลือก
function loadSelectedValues(){

    selectIds.forEach(id => {

        const select = document.getElementById(id);

        if(!select){
            return;
        }

        const savedValue =
            localStorage.getItem("duckbet_" + id);

        if(savedValue !== null){

            // ตรวจว่าค่านี้ยังมีอยู่ใน option หรือไม่
            const optionExists =
                [...select.options]
                .some(option => option.value === savedValue);

            if(optionExists){

                select.value = savedValue;

            }

        }

    });

}


// บันทึกทุกครั้งที่เปลี่ยน
selectIds.forEach(id => {

    const select = document.getElementById(id);

    if(!select){
        return;
    }

    select.addEventListener("change", function(){

        localStorage.setItem(
            "duckbet_" + id,
            this.value
        );

    });

});

window.clearCurrentRound = function(){

    if(!confirm("ต้องการล้างโพยและตัวเลือกทั้งหมดของรอบนี้ไหม?")){
        return;
    }

    // ล้างโพย
    bets = [];

    localStorage.removeItem("duckbet_bets");

    // ล้างค่าที่เลือก
    selectIds.forEach(id => {
        localStorage.removeItem("duckbet_" + id);
    });

    // ล้างตาราง Lists
    refreshTable();

    // คืนค่า dropdown เป็นค่าแรก
    loadSelectedValues();

    alert("ล้างรอบปัจจุบันแล้ว");

};

async function fixOldRaceNumbers(){

    const snapshot = await getDocs(
        collection(db, "races")
    );

    let races = [];

    snapshot.forEach(raceDoc => {

        races.push({
            id: raceDoc.id,
            data: raceDoc.data()
        });

    });

    // เรียงจากเก่า → ใหม่
    races.sort((a, b) => {

        const dateA = a.data.date?.toDate
            ? a.data.date.toDate()
            : new Date(a.data.date);

        const dateB = b.data.date?.toDate
            ? b.data.date.toDate()
            : new Date(b.data.date);

        return dateA - dateB;

    });

    // ใส่เลข Race ให้ของเก่า
    for(let i = 0; i < races.length; i++){

        const raceNumber = i + 1;

        await updateDoc(
            doc(db, "races", races[i].id),
            {
                raceNumber: raceNumber
            }
        );

    }

    console.log("จัดเลข Race เก่าเรียบร้อย");

}

loadPlayers();
refreshTable();
loadRaceDropdown();