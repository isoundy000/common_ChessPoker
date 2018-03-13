import {Poker} from '../../model/Poker';
import { Algorithm } from '../Algorithm';
import { common } from '../../utils/common';

export  namespace landlordsAlgorithm {

    const king_small:number = 65
    const king_big:number = 66
    const p_2_weight:number = 12
    const king_small_weight:number = 13
    const king_big_weight:number = 14


    export const enum PokerType{
        SINGLE,//单张
        TWINS,//对子
        BOMB_KING,//王炸
        THREE,//三张
        THREE_BAND_1,//三带一
        BOMB,//炸弹
        THREE_BAND_2,//三带二
        STRAIGHT_1,//单顺
        STRAIGHT_2,//双顺
        STRAIGHT_3,//三顺
        FOUR_WITH_2,//四带二
        FOUR_WITH_4,//四带两对
        PLANE_WITH_SINGLE,//飞机带单
        PLANE_WITH_TWINS //飞机带双
    }

    export interface PokersMsg{
        info:Array<number>;         //每个权值牌的张数
        cards:Array<Array<number>>; //每个权值的具体牌值
    }

    export interface TypeMsg{
        yes:boolean; //是否是此牌型
        type?:PokerType;//牌型
        weight?:number;//牌型之内牌的权值
        repeated?:number;//几连
    }

    /**
     * 是否是有效的牌值
     */
    export function isValidPokerNumber(poker:number):boolean{
        if(0>poker) return false;
        let card:Poker.Card = Algorithm.numberToPoker(poker);
        if(0>card.color||0>card.value) return false
        return Poker.Color.BACK>card.color && Poker.Value.v_back>card.value
    }

    /**
     * 是否此数组为有效的牌值数组
     */
    export function isValidPokersArray(pokers:Array<number>):boolean{
        for(let e of pokers){
            if(!isValidPokerNumber(e)) return false
        }
        return true
    }

    /**
     * 获取单张扑克权值
     */
    export function getPokerWeight(poker:number):number{
        return Algorithm.numberToPoker(poker).value
    }

    /**
     * 获取一组扑克权值的数组
     */
    export function getPokersWeight(pokers:Array<number>):Array<number>{
        let ws:Array<number> = []
        for(let e of pokers){
            ws.push(getPokerWeight(e))
        }
        return ws
    }


    /**
     * 获取扑克类型权值
     */
    export function getPokerTypeWeight(type:PokerType):number{
        switch (type) {
            case PokerType.BOMB_KING:
                return 100;
            case PokerType.BOMB:
                return 10;
            default:
                return 0;
        }
    }

    /**
     * 获取牌组信息
     */
     export function getPokersMsg(pokers:Array<number>):PokersMsg{
        let info:Array<number> = [
            0,0,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0]
        let cards:Array<Array<number>> = [
            [],[],[],[],[],
            [],[],[],[],[],
            [],[],[],[],[]
        ]
        let len:number = pokers.length;
        for (let i:number = 0 ; i < len ; i++){
            let w:number = getPokerWeight(pokers[i]);
            info[w]++;
            cards[w].push(pokers[i])
        }
        return {info:info,cards:cards};
     }

     /**
      * 获取几副扑克牌
      */
      export function getPokers(count:number=1):Array<number>{
          let res:Array<number> = []
          for(let i:number=0 ; i < count ; i ++ ){
            res = res.concat(Algorithm.pokersToArray((new Poker.CardPair()).getCards()));
          }
          return res
      }

      /**
       * 洗牌
       */
      export function shufflePokers(pokers:Array<number>):Array<number>{
         return Algorithm.shuffleArray(pokers)
      }


      /**
       * 删除指定权值的若干张牌
       */
      export function removeWeightFromArray(weight:number,count:number,pokers:Array<number>):number{
         let tmp:Array<number> = [].concat(pokers)
         for(let e of tmp){
            let w:number = getPokerWeight(e)
            if(w===weight&&count>0){
                common.removeElementFromArray(e,pokers)
                count--
            } 
         }
         return count
      }


      /**
       * 是否全为对子
       */
      export function isAllTwins(pokers:Array<number>):boolean{
          let len = pokers.length
          if(2<=len&&0===len%2){
              let msg:PokersMsg = getPokersMsg(pokers)
              for(let i:number=0;i<msg.info.length;i++){
                    if(msg.info[i]&&2!=msg.info[i]) return false
              }
              return true
          }
          return false
      }


      /**-----------------------------------
       *
       *   牌型判断函数  begin
       * -----------------------------------
       */

        /**
        * 是否是单张
        */
       export function isSingle(pokers:Array<number>):TypeMsg{
            if(1===pokers.length){
                let ws = getPokersWeight(pokers)
                ws.sort()
                return {
                    yes:true,
                    type:PokerType.SINGLE,
                    weight:ws[0],
                    repeated:1
                }
            } 
            return {
                yes:false
            }
       }

       /**
        * 是否是对子
        */
       export function isTwins(pokers:Array<number>):TypeMsg{
            if(2===pokers.length){
                let ws = getPokersWeight(pokers)
                ws.sort()
                if(ws[0]===ws[1]){
                    return {
                        yes:true,
                        type:PokerType.TWINS,
                        weight:ws[0],
                        repeated:1
                    }
                }
            } 
            return {
                yes:false
            }
       }

      /**
       * 是否是王炸
       */
       export function isBombKing(pokers:Array<number>):TypeMsg{
           if(2===pokers.length){
                let ws = getPokersWeight(pokers)
                ws.sort()
                if(king_small==pokers[0]||king_big==pokers[0]){
                    if(king_small==pokers[1]||king_big==pokers[1]){
                        return {
                            yes:true,
                            type:PokerType.BOMB_KING,
                            weight:ws[0],
                            repeated:1
                        }
                    }
                }
           }
            return {
                yes:false
            }
       }

       /**
        * 是否是三张
        */
        export function isThree(pokers:Array<number>):TypeMsg{
            if(3===pokers.length){
                let ws = getPokersWeight(pokers)
                ws.sort()
                if(ws[0]===ws[2]){
                    return {
                        yes:true,
                        type:PokerType.THREE,
                        weight:ws[0],
                        repeated:1
                    }
                }
            }
            return {
                yes:false
            }
        }

        /**
         * 是否三带一
         */
        export function isThreeBand1(pokers:Array<number>):TypeMsg{
            if(4===pokers.length){
                let ws = getPokersWeight(pokers)
                ws.sort()
                if(ws[0]===ws[2]||ws[1]===ws[3]){
                     return {
                        yes:true,
                        type:PokerType.THREE_BAND_1,
                        weight:ws[1],
                        repeated:1
                    }                   
                }
            }
            return {
                yes:false
            }
        }

        /**
         * 是否炸弹
         */
        export function isBomb(pokers:Array<number>):TypeMsg{
            if(4===pokers.length){
                let ws = getPokersWeight(pokers)
                ws.sort()
                if(ws[0]===ws[3]){
                    return {
                        yes:true,
                        type:PokerType.BOMB,
                        weight:ws[0],
                        repeated:1
                    }
                }
            }
            return {
                yes:false
            }
        }

        /**
         * 是否三带二
         */
        export function isThreeBand2(pokers:Array<number>):TypeMsg{
            if(5===pokers.length){
                let ws = getPokersWeight(pokers)
                ws.sort()
                if(ws[0]===ws[2]&& ws[3]===ws[4]||(ws[0]===ws[1]&&ws[2]===ws[4])){
                    return {
                        yes:true,
                        type:PokerType.THREE_BAND_2,
                        weight:ws[2],
                        repeated:1
                    }                    
                }
            }
            return {
                yes:false
            }
        }

        /**
         * 是否单顺
         */
        export function isStraight1(pokers:Array<number>):TypeMsg{
            let len = pokers.length
            if(5<=len){
                let ws = getPokersWeight(pokers)
                ws.sort()
                if(p_2_weight>ws[len-1]){
                    for(let i:number = 0 ; i < len-1 ; i ++ ){
                        if(ws[i]+1!==ws[i+1]) 
                        return {
                            yes:false
                        }
                    }
                    return {
                        yes:true,
                        type:PokerType.STRAIGHT_1,
                        weight:ws[0],
                        repeated:len
                    }
                }
            }
            return {
                yes:false
            }
        }

        /**
         * 是否双顺
         */
        export function isStraight2(pokers:Array<number>):TypeMsg{
            let len = pokers.length
            if(6<=len&&0===len%2){
                let ws = getPokersWeight(pokers)
                ws.sort()
                if(p_2_weight>ws[len-1]){
                    let msg = getPokersMsg(pokers)
                    for(let i:number=ws[0] ; i < ws[len-1]+1 ; i++){
                        if(2 !== msg.info[i]) 
                        return {
                            yes:false
                        }
                    }
                    return {
                        yes:true,
                        type:PokerType.STRAIGHT_2,
                        weight:ws[0],
                        repeated:len
                    }
                }
            }
            return {
                yes:false
            }
        }

        /**
         * 是否三顺
         */
        export function isStraight3(pokers:Array<number>):TypeMsg{
            let len = pokers.length
            if(9<=len&&0===len%3){
                let ws = getPokersWeight(pokers)
                ws.sort()
                if(p_2_weight>ws[len-1]){
                    let msg = getPokersMsg(pokers)
                    for(let i:number=ws[0] ; i < ws[len-1]+1 ; i++){
                        if(3 !== msg.info[i]) 
                        return {
                            yes:false
                        }
                    }
                    return {
                        yes:true,
                        type:PokerType.STRAIGHT_3,
                        weight:ws[0],
                        repeated:len
                    }
                }
            }
            return {
                yes:false
            }
        }

        /**
         * 是否四带二
         */
        export function isFour2(pokers:Array<number>):TypeMsg{
            let len = pokers.length
            if(6===len){
                let ws = getPokersWeight(pokers)
                ws.sort()
                if(ws[2]===ws[5]||ws[1]===ws[4]||ws[0]===ws[3]){
                    return {
                        yes:true,
                        type:PokerType.FOUR_WITH_2,
                        weight:ws[2],
                        repeated:1
                    }
                }
            }
            return {
                yes:false
            }
        }

        /**
         * 是否四带两对
         */
        export function isFour4(pokers:Array<number>):TypeMsg{
            let len = pokers.length
            if(8===len){
                let ws = getPokersWeight(pokers)
                ws.sort()
                let indexArr:Array<Array<number>> = [
                    [4,7,2,3,0,1], //11 22 3333
                    [2,5,6,7,0,1], //11 2222 33
                    [0,3,4,5,6,7]  //1111 22 33
                ]
                for(let i:number=0 ; i< indexArr.length ; i++){
                    if(ws[indexArr[i][0]]===ws[indexArr[i][1]]
                    &&ws[indexArr[i][2]]===ws[indexArr[i][3]]
                    && ws[indexArr[i][4]]===ws[indexArr[i][5]]){
                        return {
                            yes:true,
                            type:PokerType.FOUR_WITH_4,
                            weight:ws[indexArr[i][0]],
                            repeated:1
                        }                       
                    }
                }            
            }
            return {
                yes:false
            }
        }

        /**
         * 是否飞机带单
         * 1.如果为飞机，则长度 为 len / 4
         * 2.先寻找所有的连续次数为 len / 4 或者以上的三张
         * 3.优先获取权值较大的满足条件的 三张
         * 4.判断是否存在，以及 返回
         */
        export function isPlane1(pokers:Array<number>):TypeMsg{
            let len = pokers.length
            if(8<=len&&0==len%4){
                let ws = getPokersWeight(pokers)
                ws.sort()
                let msg:PokersMsg = getPokersMsg(pokers)
                let planeLen:number = len / 4
                let startIndex:number = 0
                let threeArr:Array<Array<number>> = []
                let three:Array<number> = []
                for(let i:number=ws[0] ; i < ws[len-1]+1 && i < p_2_weight ; i++){
                    if(3 <= msg.info[i]){
                        three.push(i)
                        startIndex ++
                    }else{
                        if(planeLen<=startIndex){
                            let tmp:Array<number> = []
                            for(let e of three){
                                tmp.push(e)
                            }
                            threeArr.push(tmp)
                        }
                        startIndex = 0
                        three = []
                    }
                }
                if(planeLen<=startIndex){
                    let tmp:Array<number> = []
                    for(let e of three){
                        tmp.push(e)
                    }
                    threeArr.push(tmp)
                }
                startIndex = 0
                three = []               

                if(threeArr.length){
                    //取最大值
                    let max:number = 0
                    for(let e of threeArr){
                        let lenE = e.length
                        max = e[lenE-1]>max?e[lenE-1]:max
                    }
                    return {
                        yes:true,
                        type:PokerType.PLANE_WITH_SINGLE,
                        weight:max,
                        repeated:len/4
                    }
                }
            }
            return {
                yes:false
            }
        }

        /**
         * 是否是飞机双
         * 1.如果为飞机，则长度 为 len / 5
         * 2.先寻找所有的连续次数为 len / 5 或者以上的三张
         * 3.筛选排除满足条件的三张之后剩余的是否全为对子
         * 4.判断是否存在，以及 返回
         */
        export function isPlane2(pokers:Array<number>):TypeMsg{
            let len = pokers.length
            if(10<=len&&0==len%5){
                let ws = getPokersWeight(pokers)
                ws.sort()
                let msg:PokersMsg = getPokersMsg(pokers)
                let planeLen:number = len / 5
                let startIndex:number = 0
                let threeArr:Array<Array<number>> = []
                let three:Array<number> = []
                for(let i:number=ws[0] ; i < ws[len-1]+1 && i < p_2_weight ; i++){
                    if(3 <= msg.info[i]){
                        three.push(i)
                        startIndex ++
                    }else{
                        if(planeLen<=startIndex){
                            let tmp:Array<number> = []
                            for(let e of three){
                                tmp.push(e)
                            }
                            threeArr.push(tmp)
                        }
                        startIndex = 0
                        three = []
                    }
                }
                if(planeLen<=startIndex){
                    let tmp:Array<number> = []
                    for(let e of three){
                        tmp.push(e)
                    }
                    threeArr.push(tmp)
                }
                startIndex = 0
                three = []
                if(threeArr.length){
                    //筛选
                    let threeArr2:Array<Array<number>> = []
                    let three2:Array<number> = []
                    let threeArrLen:number = threeArr.length
                    for(let k:number=0;k<threeArrLen;k++){
                        let t = [].concat(threeArr[k])
                        while(planeLen<=t.length){
                            let tmpPokers:Array<number>= [].concat(pokers)
                            for(let j:number=0;j<planeLen;j++){
                                three2.push(t[t.length-j-1])
                                removeWeightFromArray(t[t.length-j-1],3,tmpPokers)
                            }
                            if(isAllTwins(tmpPokers)){
                                three2.sort()
                                threeArr2.push([].concat(three2))
                            }
                            three2 = []
                            common.removeElementFromArray(t[t.length-1],t)
                        }
                    }
                    if(threeArr2.length){
                        //取最大值
                        let max:number = -1
                        for(let e of threeArr2){
                            let lenE = e.length
                            max = e[lenE-1]>max?e[lenE-1]:max
                        }
                        return {
                            yes:true,
                            type:PokerType.PLANE_WITH_TWINS,
                            weight:max,
                            repeated:len/5
                        }
                    }
                }                              
            }
            return {
                yes:false
            }           
        }

        /**
         * 获取牌组类型
         * @param pokers 
         */
        export function getPokersTypes(pokers:Array<number>):Array<TypeMsg>{
            let res:Array<TypeMsg> = []
            if(isValidPokersArray(pokers)){
                let SINGLE = isSingle(pokers)
                if(SINGLE.yes){
                    res.push(SINGLE)
                }
                let TWINS = isTwins(pokers)
                if(TWINS.yes){
                    res.push(TWINS)
                }
                let BOMB_KING = isBombKing(pokers)
                if(BOMB_KING.yes){
                    res.push(BOMB_KING)
                }
                let THREE = isThree(pokers)
                if(THREE.yes){
                    res.push(THREE)
                }
                let THREE_BAND_1 = isThreeBand1(pokers)
                if(THREE_BAND_1.yes){
                    res.push(THREE_BAND_1)
                }
                let THREE_BAND_2 = isThreeBand2(pokers)
                if(THREE_BAND_2.yes){
                    res.push(THREE_BAND_2)
                }
                let BOMB = isBomb(pokers)
                if(BOMB.yes){
                    res.push(BOMB)
                }
                let STRAIGHT_1 = isStraight1(pokers)
                if(STRAIGHT_1.yes){
                    res.push(STRAIGHT_1)
                }               
                let STRAIGHT_2 = isStraight2(pokers)
                if(STRAIGHT_2.yes){
                    res.push(STRAIGHT_2)
                }   
                let STRAIGHT_3 = isStraight3(pokers)
                if(STRAIGHT_3.yes){
                    res.push(STRAIGHT_3)
                }   
                let FOUR_WITH_2 = isFour2(pokers)
                if(FOUR_WITH_2.yes){
                    res.push(FOUR_WITH_2)
                } 
                let FOUR_WITH_4 = isFour4(pokers)
                if(FOUR_WITH_4.yes){
                    res.push(FOUR_WITH_4)
                } 
                let PLANE_WITH_SINGLE = isPlane1(pokers)
                if(PLANE_WITH_SINGLE.yes){
                    res.push(PLANE_WITH_SINGLE)
                } 
                let PLANE_WITH_TWINS = isPlane2(pokers)
                if(PLANE_WITH_TWINS.yes){
                    res.push(PLANE_WITH_TWINS)
                } 
            }
            if(res.length) return res
            return [{
                yes:false
            }]
        }

}