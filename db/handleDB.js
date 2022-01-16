const db = require("./nodejs-orm")

async function handleDB(res, tableName, methodName, errMsg, n1, n2){

    // console.log("执行handleDB函数");
    
    let Model = db.model(tableName);
    let result

    try{
        result = await new Promise((resolve, reject)=>{
            // Model["find"]("",(err, data)=>{

            if(!n1){  
                // 表示n1n2参数也没有传
                Model[methodName]((err, data)=>{
                    if(err)reject(err);
                    resolve(data);
                })   
                return
            }
            
            // 程序能够执行到这里，说明n1已经有了
            if(!n2){
                // 没有传递n2
                Model[methodName](n1, (err, data)=>{
                    if(err)reject(err);
                    resolve(data);
                })   
                return
            }

            // 程序能够执行这里， 说明n1, n2都传了
            Model[methodName](n1,n2, (err, data)=>{
                if(err)reject(err);
                resolve(data);
            })  


        })   
    }catch(err){
        console.log(err); // 在后端打印异常
        res.send({errMsg:errMsg})  // 通知前端出现异常
        return
    }


    return result


}


module.exports = handleDB