import {

    db,
    collection,
    getDocs
    
    } from "./firebase.js";
    
    
    
    async function loadStat(){
    
    
    const snapshot = await getDocs(
        collection(db,"races")
    );
    
    
    
    let players={};
    
    
    let horses = {

        "ODIN":{
            first:0,
            second:0,
            third:0,
            fourth:0
        },
    
        "THOR":{
            first:0,
            second:0,
            third:0,
            fourth:0
        },
    
        "ZEUS":{
            first:0,
            second:0,
            third:0,
            fourth:0
        },
    
        "POSEIDON":{
            first:0,
            second:0,
            third:0,
            fourth:0
        }
    
    };
    
    
    
    snapshot.forEach(doc=>{
    
    
        const race=doc.data();
    
    
    
        // ----------------
        // ม้าชนะ
        // ----------------
    
        let result = race.result;


        // อันดับ 1
        horses[result.first].first++;
        
        
        // อันดับ 2
        horses[result.second].second++;
        
        
        // อันดับ 3
        horses[result.third].third++;
        
        
        // อันดับ 4
        horses[result.fourth].fourth++;
    
    
    
        // ----------------
        // ผู้เล่น
        // ----------------
    
    
        race.bets.forEach(b=>{
    
    
            if(!players[b.player]){
    
    
                players[b.player]={

                    total:0,
                    win:0,
                    lose:0,
                    bet:0,
                    get:0
                
                };
    
    
            }
    
    
    
            let p=players[b.player];
    
    
            p.total++;
    
            p.bet += b.amount;


            if(b.win){

                p.get += b.reward;

            }
            else{

                p.get -= b.amount;

            }
    
    
    
            if(b.win){
    
                p.win++;
    
            }
            else{
    
                p.lose++;
    
            }
    
    
    
        });
    
    
    
    });
    
    
    
    showPlayerStat(players);
    
    showHorseStat(horses);
    
    
    
    }
    
    
    
    
    
    function showPlayerStat(players){
    
    
    let table=document.getElementById(
        "playerStat"
    );
    
    
    
    table.innerHTML="";
    
    
    
    Object.keys(players).forEach(name=>{
    
    
    let p=players[name];
    
    
    let profit=p.get;
    
    
    
    table.innerHTML+=`
    
    <tr>
    
    <td>${name}</td>
    
    <td>${p.total}</td>
    
    <td class="win">${p.win}</td>
    
    <td class="loss">${p.lose}</td>
    
    <td>${p.bet}</td>
    
    <td>${p.get}</td>
    
    <td>
    ${profit}
    </td>
    
    
    </tr>
    
    
    `;
    
    
    });
    
    
    }
    
    
    
    
    
    function showHorseStat(horses){


        let table=document.getElementById(
            "horseStat"
        );
        
        
        table.innerHTML="";
        
        
        
        Object.keys(horses).forEach(h=>{
        
        
        let horse = horses[h];
        
        
        
        table.innerHTML+=`
        
        <tr>
        
        <td>
        🦆 Duck ${h}
        </td>
        
        
        <td>
        ${horse.first}
        </td>
        
        
        <td>
        ${horse.second}
        </td>
        
        
        <td>
        ${horse.third}
        </td>
        
        
        <td>
        ${horse.fourth}
        </td>
        
        
        </tr>
        
        `;
        
        
        });
        
        
        }

    loadStat();