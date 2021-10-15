/**
 * Created by josiah on 2021/10/13.
 */
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const BillScript = require("./billScript");

const rl = readline.createInterface(process.stdin, process.stdout);

rl.question("输入即将合并账单的年月（YYYYMM）：", async (answer) => {
  try {
    const folderPath = path.join(__dirname + "/billFiles/" + answer + "/");
    const billObject = new BillScript(folderPath);
    const files = fs.readdirSync(folderPath);

    for (file of files) {
      if (file.split(".")[1] === "csv") {
        if (file.split("_")[0] === "alipay") {
          billObject.readAlipay(file);
        } else {
          await billObject.readWechart(file);
        }
      }
    }
    await billObject.write();

    rl.close();
  } catch (error) {
    console.log("输入错误！");
    rl.close();
  }
});

rl.on("close", () => {
  process.exit(0);
});
