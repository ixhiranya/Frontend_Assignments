const sql = require("mssql/msnodesqlv8");

const config = {
  server: "localhost",
  database: "ApplicationSystem",
  driver: "ODBC Driver 17 for SQL Server",
  options: {
    trustedConnection: true
  }
};

async function connectDB(){
    try{
        await sql.connect(config);
        console.log("Connected to SQL Server");
    }catch(err){
        console.log(err);
    }
}

module.exports={sql,connectDB};