import {
    db,
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    orderBy,
    query
} from "./firebase.js";


let races = [];



// =======================
// Load Race From Firebase
// =======================

async function loadRaces(){

    try{

        const snapshot =
        await getDocs(
            collection(db,"races")
        );


        races=[];


        snapshot.forEach(doc=>{

            races.push({

                id:doc.id,

                ...doc.data()

            });

        });


        showRaceList();


    }
    catch(error){

        console.error(
            "Load race error:",
            error
        );

    }

}

async function loadPoolHistory(){


    try{


        const table =
        document.getElementById(
            "rewardTable"
        );


        table.innerHTML="";


        const q =
        query(
            collection(db,"guildHistory"),
            orderBy("timestamp","desc")
        );


        const snapshot =
        await getDocs(q);



        snapshot.forEach(item=>{


            let h =
            item.data();


            table.innerHTML += `

            <tr>

            <td>${h.race}</td>

            <td>${h.pool}</td>

            <td>${h.members}</td>

            <td>${h.perPerson}</td>

            <td>
            ${h.dealerChange}
            </td>

            <td>
            ${h.status}
            </td>

            <td>
            ${h.dealerFinal}
            </td>

            <td>
            ${h.date}
            </td>

            <td>

            <button class="deleteBtn" onclick="deletePoolHistory('${item.id}')">

            🗑️ Delete

            </button>

            </td>

            </tr>

            `;


        });


    }
    catch(error){

        console.error(
            "History Error:",
            error
        );

    }


}


// =======================
// Show Race List
// =======================

function showRaceList(){

    const select =
    document.getElementById(
        "raceSelect"
    );


    select.innerHTML="";


    races.forEach((race,index)=>{


        let option =
        document.createElement("option");


        option.value=index;


        option.textContent =
        "Race "+(index+1);


        select.appendChild(option);


    });

}




// =======================
// Load Race Button
// =======================

document
.getElementById("loadRace")
.addEventListener(
    "click",
    showGuildStat
);






// =======================
// Calculate Race Result
// =======================

function showGuildStat(){


    let index =
    document
    .getElementById("raceSelect")
    .value;



    let race =
    races[index];



    if(!race){

        alert("ยังไม่มีข้อมูล Race");

        return;

    }




    let players={};





    race.bets.forEach(b=>{


        if(!players[b.player]){


            players[b.player]={

                bet:0,

                get:0,

                profit:0,

                win:0,

                lose:0

            };


        }



        let p =
        players[b.player];




        p.bet += Number(b.amount);




        if(b.win === true){


            p.get += Number(b.reward);


            p.profit += Number(b.reward);


            p.win++;


        }
        else{


            p.profit -= Number(b.amount);


            p.lose++;


        }



    });






    // =====================
    // Calculate Diamond
    // =====================


    let pool =
    Number(
        document
        .getElementById("poolDiamond")
        .value
    );



    let members =
    Number(
        document
        .getElementById("memberCount")
        .value
    );



    let perPerson =
    Math.floor(
        pool / members
    );





    // =====================
    // Dealer Calculate
    // =====================


    let dealerProfit = 0;



    Object.values(players)
    .forEach(p=>{


        dealerProfit -= p.profit;


    });





    let dealerFinal =
    perPerson + dealerProfit;





    render(
        players,
        perPerson
    );



    renderDealer(
        perPerson,
        dealerProfit,
        dealerFinal
    );

    addPoolHistory(

        "Race "+(Number(index)+1),
    
        pool,
    
        members,
    
        perPerson,
    
        dealerProfit,
    
        dealerFinal
    
    );



}








// =======================
// Render Player Table
// =======================

function render(
    players,
    perPerson
){


    let table =
    document
    .getElementById("guildTable");



    table.innerHTML="";




    Object.keys(players)
    .forEach(name=>{


        let p =
        players[name];



        table.innerHTML += `


        <tr>


        <td>${name}</td>


        <td>${p.bet}</td>


        <td>${p.get}</td>


        <td>${p.win}</td>


        <td>${p.lose}</td>


        <td style="
        color:${p.profit>=0?'lime':'red'}
        ">

        ${perPerson + p.profit}

        </td>


        </tr>


        `;


    });


}







// =======================
// Render Dealer Box
// =======================

function renderDealer(
    base,
    change,
    final
){



    let box =
    document
    .getElementById(
        "dealerResult"
    );



    if(!box) return;



    box.innerHTML = `


    💎 Base Diamond :
    ${base}

    <br>


    📊 Dealer Change :
    <span style="
    color:${change>=0?'lime':'red'}
    ">

    ${change>=0?"+":""}${change}

    </span>


    <br><br>


    🏦 Dealer Final :

    <b>
    ${final}
    </b>


    `;



}







// =======================
// Calculate Pool
// =======================


document
.getElementById("calculatePool")
.addEventListener(
    "click",
    calculatePool
);





function calculatePool(){



    let diamond =
    Number(
        document
        .getElementById("poolDiamond")
        .value
    );



    let members =
    Number(
        document
        .getElementById("memberCount")
        .value
    );



    if(
        diamond <=0 ||
        members <=0
    ){


        alert(
            "กรุณากรอกข้อมูลให้ครบ"
        );


        return;

    }




    let perPerson =
    Math.floor(
        diamond / members
    );




    document
    .getElementById(
        "poolResult"
    )
    .innerHTML = `


    💎 กองกลาง :
    ${diamond}

    <br>


    👥 สมาชิก :
    ${members}
    คน


    <br>


    🎁 แจกคนละ :
    ${perPerson}
    Diamond


    `;



}

async function addPoolHistory(
    raceName,
    pool,
    members,
    perPerson,
    dealerProfit,
    dealerFinal
){


    await addDoc(
        collection(db,"guildHistory"),
        {


            race:raceName,

            pool:pool,

            members:members,

            perPerson:perPerson,


            dealerChange:dealerProfit,


            dealerFinal:dealerFinal,


            status:
            dealerProfit >=0
            ?
            "กำไร"
            :
            "ขาดทุน",


            date:
            new Date()
            .toLocaleDateString("th-TH"),


            timestamp:
            Date.now()


        }
    );


    loadPoolHistory();


}

// =======================
// Delete Guild History
// =======================

window.deletePoolHistory = async function(id){


    if(!confirm("ลบประวัติกองกลางนี้ ?")){

        return;

    }


    try{


        await deleteDoc(
            doc(
                db,
                "guildHistory",
                id
            )
        );


        alert("ลบสำเร็จ");


        loadPoolHistory();


    }
    catch(error){

        console.error(
            "Delete error:",
            error
        );

        alert("ลบไม่สำเร็จ");

    }


}
// =======================
// Start
// =======================

loadRaces();

loadPoolHistory();