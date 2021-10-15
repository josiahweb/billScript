const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");
const ExcelJS = require("exceljs");

class BillScript {
  constructor(folderPath) {
    this.folderPath = folderPath;
    this.mergeArray = [];
    this.formatString = function(s) {
      return s.replace(/(\s*$)/g, "");
    };
  }
  async readWechart(fileName) {
    let that = this;
    const workbook = new ExcelJS.Workbook();
    const worksheet = await workbook.csv.readFile(
      path.join(this.folderPath, fileName)
    );
    worksheet.eachRow(function(row, rowNumber) {
      let templateObject = {
        item: null,
        time: null,
        class: null,
        money: null,
        remark: null,
      };
      if (rowNumber > 18) {
        if (row.values[5] === "支出") {
          templateObject.item = row.values[2] + ":" + row.values[3];
          templateObject.time = row.values[1];
          templateObject.class = "";
          templateObject.money = row.values[6].substring(1);
          templateObject.remark = "";
          that.mergeArray.push(templateObject);
        }
      }
    });
  }
  readAlipay(fileName) {
    let that = this;
    let rows = iconv
      .decode(fs.readFileSync(path.join(this.folderPath, fileName)), "gbk")
      .split(/\r?\n/);
    let k = 2;
    let rowString = [];
    while (rows[k][0] !== "-") {
      let templateObject = {
        item: null,
        time: null,
        class: null,
        money: null,
        remark: null,
      };
      rowString = rows[k].split(",");
      if (that.formatString(rowString[0]) === "支出") {
        if (that.formatString(rowString[6]) === "交易成功") {
          templateObject.item =
            that.formatString(rowString[1]) +
            ":" +
            that.formatString(rowString[7]);
          templateObject.time = that.formatString(rowString[10]);
          templateObject.class = "";
          templateObject.money = that.formatString(rowString[5]);
          templateObject.remark = "";
          that.mergeArray.push(templateObject);
        }
      }
      k++;
    }
  }
  async write() {
    const workbook = new ExcelJS.Workbook();
    workbook.addWorksheet("My Sheet");
    let worksheet = workbook.getWorksheet("My Sheet");
    worksheet.columns = [
      { header: "项目", key: "item", width: 10 },
      { header: "时间", key: "time", width: 32 },
      { header: "分类", key: "class", width: 10 },
      { header: "金额", key: "money", width: 10 },
      { header: "备注", key: "remark", width: 10 },
    ];
    for (let k = 0; k < this.mergeArray.length; k++) {
      worksheet.addRow({
        item: this.mergeArray[k].item,
        time: this.mergeArray[k].time,
        class: this.mergeArray[k].class,
        money: this.mergeArray[k].money,
        remark: this.mergeArray[k].remark,
      });
    }
    await workbook.csv.writeFile("filename.csv");
  }
}

module.exports = BillScript;
