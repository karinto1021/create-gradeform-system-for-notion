ID = 0;
MONTH = 1;

function get_programdata_from_notion() {
    // const ss = SpreadsheetApp.getActiveSpreadsheet()
    // const sheet = ss.getSheetByName('2022')
    const sheet = getSheet();
    var flag = 0;

    id_month = getAddProgramID(sheet);
    // console.log(id_month[0])
    // console.log(id_month[1])

    // Notionからデータを取得しSheetに書き込む
    if(id_month[ID].length != 0){
        addAllPresentationDataToSheet(id_month[ID][0], id_month[MONTH][0], sheet);
    }else{
        flag = 1;
    }

    return flag;
}