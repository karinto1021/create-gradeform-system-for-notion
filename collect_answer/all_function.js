// const
const EMAIL = 0;
const NAME = 1;
const AFFILIATION = 2;
const POSITION = 3;


// スクリプトプロパティを取得
function scriptPropertyFor(key) {
    return PropertiesService.getScriptProperties().getProperty(key)
}

// NOTION_API_KEY を取得
function notionAPIKey() {
    return scriptPropertyFor("NOTION_API_KEY")
}

// NOTION_VERSION を取得
function notionVersion() {
    return scriptPropertyFor("NOTION_VERSION")
}

// PROGRAM_DATABASE_ID を取得
function programDatabaseID() {
    return scriptPropertyFor("PROGRAM_DATABASE_ID")
}

// PRESENTATION_DATABASE_ID を取得
function presentationDatabaseID() {
    return scriptPropertyFor("PRESENTATION_DATABASE_ID")
}

// PRESENTER_DATABASE_ID を取得
function presenterDatabaseID() {
    return scriptPropertyFor("PRESENTER_DATABASE_ID")
}

// GRADE_DATABASE_ID を取得
function gradeDatabaseID() {
    return scriptPropertyFor("GRADE_DATABASE_ID")
}

// GRADER_DATABASE_ID を取得
function graderDatabaseID() {
    return scriptPropertyFor("GRADER_DATABASE_ID")
}

// 現在のアクティブシートを得る
// アクティブシートは、スクリプトを実行したときに表示されているシート
// または、変更されたシートなので、回答の集計ではそのままでよい
function getSheet() {
    return SpreadsheetApp.getActiveSheet()
}

// Notion に payload を send する
function sendNotion(url_sub, payload, method) {
    const options = {
        "method": method,
        "headers": {
        "Content-type": "application/json",
        "Authorization": "Bearer " + notionAPIKey(),
        "Notion-Version": "2022-06-28",
        },
        "payload": payload ? JSON.stringify(payload) : null
    };
    // デバッグ時にはコメントを外す
    // console.log(options)
    Utilities.sleep(400)
    const url = "https://api.notion.com/v1/" + url_sub
    // console.log(url)
    return JSON.parse(UrlFetchApp.fetch(url, options))
}

// Retrieve Page API を呼び出す
function getPage(page_id) {
    return sendNotion("pages/" + page_id, null, "GET")
}

function unique(array) {
    return array.filter((x, i) => array.indexOf(x) === i);
}

// sheet(回答)の最終行を取得
// タイムスタンプは入ってない
function getLastLine(sheet){
    const lastRow = sheet.getLastRow()
    const lastColumn = sheet.getLastColumn()

    return sheet.getRange(lastRow, 1, 1, lastColumn).getValues()[0]
}

// program_page_idから(その月の)properties(presentation)を取得
function getPresentationFromProgram(program_page_id) {

    payload = {
        filter: {
            and: [
                {
                    property: "実施月",
                    relation: {
                        contains: program_page_id
                    }
                },
                {
                    property: "学生",
                    rollup: {
                        any: {
                            checkbox: {
                                equals: true
                            }
                        }
                    }
                }
            ]
        },
        sorts: [
            {
                property: "発表番号",
                direction: "ascending"
            }
        ],
        page_size: 100
    }

    return sendNotion("databases/" + presentationDatabaseID() + "/query", payload ,"POST")
}

function getGraderDB(){
    return sendNotion("databases/" + graderDatabaseID() + "/query", null ,"POST")
}

function createGraderIDHashEmailKey(grader_data){
    return grader_data.results.reduce(
        (h, p) => {
            h[p.properties.email.email] = p.id
            return h
        }, {}
    )
}

function createGraderArray(grader_data){
    return grader_data.results.reduce(
        (h, p) => {
            h.push(p.properties.採点者.title[0].plain_text)
            return h
        }, []
    )
}

function createGraderEmailArray(grader_data){
    return grader_data.results.reduce(
        (h, p) => {
            h.push(p.properties.email.email)
            return h
        }, []
    )

}


function createPresentationIDArray(presentation_data){

    var dates = presentation_data.results.reduce(
        (h, p) => {
            h.push(p.properties.発表日.rich_text[0].plain_text)
            return h
        }, []
    )

    dates_unique = unique(dates)

    // console.log(dates)
    // console.log(unique(dates))

    var presentation_ids_hold = []
    var presentation_ids = []
    var start = 0

    for (let date of dates_unique) {
        for(let i = start; i < presentation_data.results.length; i++){
            // console.log(presentation_data.results[i].properties.発表日.rich_text[0].plain_text + "----" + date)
            if(presentation_data.results[i].properties.発表日.rich_text[0].plain_text == date){
                presentation_ids_hold.push(presentation_data.results[i].id);
            }else{
                start = i;
                break;
            }
        }
        presentation_ids.push(presentation_ids_hold)
        presentation_ids_hold = []
    }

    return presentation_ids

}

// sheetから採点者情報を取得
function getGraderInfoFromSheet(sheet){
    data = []
    data.push(getLastLine(sheet)[EMAIL+1])    //e-mail
    data.push(getLastLine(sheet)[NAME+1])    //名前
    data.push(getLastLine(sheet)[AFFILIATION+1])    //所属
    data.push(getLastLine(sheet)[POSITION+1])    //役職
    return data
}

// sheetから各発表の採点結果を取得
function getGradesFromSheet(sheet){
    var grade_data = getLastLine(sheet)

    var grades = []

    for (let i = 0; i < (grade_data.length - 7)/7; i++) {
        grades.push(grade_data[5+7*i] + grade_data[6+7*i] + grade_data[7+7*i] + grade_data[8+7*i] + grade_data[9+7*i] + grade_data[10+7*i])
    }

    return grades
    
}

// sheetから各発表の採点時のコメントを取得
function getCommentsFromSheet(sheet){
    var comment_data = getLastLine(sheet)

    var comments = []

    for (let i = 0; i < (comment_data.length - 7)/7; i++) {
        comments.push(comment_data[11+7*i])
    }

    return comments
}

// sheetからprogram_page_idを取得
function getProgramPageIDFromSheet(sheet){
    return getLastLine(sheet).slice(-2)[0]
}

// sheetから日数を取得
function getDayFromSheet(sheet){
    return getLastLine(sheet).slice(-1)[0]
}

// 一つの採点結果を送るためのpayloadを作成
// ここで送信まで行ってもいいかも！！！！！！！！！！！！！！！
function createGradePayload(presentation_id, grader_id, grade, comment){
    return {
        parent: {
            database_id: gradeDatabaseID()
        },
        properties: {
            "発表": {
                relation: [
                    {
                        id: presentation_id
                    }
                ]
            },
            "採点者": {
                relation: [
                    {
                        id: grader_id
                    }
                ]
            },
            "得点": {
                number: grade
            },
            "コメント":{
                rich_text: [
                    {
                        text: {
                            content: comment,
                            link: null
                        },
                        plain_text: comment,
                        href: null
                    }
                ]
            
            }
        }
    }
}

// 未登録の採点者を登録するためのpayloadを作成
function createGraderPayload(grader_email, grader_name, grader_aff,  grader_position){
    return {
        parent: {
          database_id: graderDatabaseID()
        },
        properties: {
          採点者: {
            title: [
              {
                text: {
                  content: grader_name,
                  link: null
                },
                plain_text: grader_name,
                href: null
              }
            ]
          },
          所属: {
            rich_text: [
              {
                text: {
                  content: grader_aff,
                  link: null
                },
                plain_text: grader_aff,
                href: null
              }
            ]
          },
          email: {
            email: grader_email
          },
          役職: {
            select: {
            name: grader_position
           }
        }
        }
      }

}


// 各発表の採点結果をgrade_DBに送信
function sendGradeToDB(sheet){
    // sheetからprogram_page_idを取得
    program_page_id = getProgramPageIDFromSheet(sheet)
    // grogramからpresentationを取得(API)
    // .resultsされてない
    presentation_datas = getPresentationFromProgram(program_page_id)
    // 発表順のpresentation_idの配列を作成
    // 1日目と2日目を分割したArrayを作成(2次元配列)
    presentation_ids = createPresentationIDArray(presentation_datas)
    // console.log(presentation_ids)

    // 日数を取得
    day = getDayFromSheet(sheet)
    // 発表順の採点結果を取得
    grades = getGradesFromSheet(sheet)
    // 採点時のコメントを取得
    comments = getCommentsFromSheet(sheet)
    // 採点者情報を取得
    grader_info = getGraderInfoFromSheet(sheet)
    // graderのデータベースを取得(API)
    grader_db = getGraderDB()
    // 採点者のemailをkeyにしたgrader_idのhashを作成
    graders_id_db = createGraderIDHashEmailKey(grader_db)
    // console.log(graders_id_db)
    // 採点者の名前の配列を作成
    // graders_db = createGraderArray(grader_datas_db)
    // 採点者のメールアドレスの配列を作成
    graders_email_db = createGraderEmailArray(grader_db)
    // console.log(graders_db)
    // 採点者が既にDBに登録されているかemailで確認
    // されていなければ登録し、grader_idを取得
    if(!graders_email_db.includes(grader_info[EMAIL])){
        add_grader = sendNotion("pages/", createGraderPayload(grader_info[EMAIL], grader_info[NAME], grader_info[AFFILIATION], grader_info[POSITION]), "POST")
        grader_id = add_grader.id
        // console.log("send grader data")
    }else{
        grader_id = graders_id_db[grader_info[EMAIL]]
    }
    // console.log(grader_id)
    // payloadを作成、sendNotionする(発表分行う)
    for (let presentation_id of presentation_ids[day-1]) {
        // console.log(presentation_id)
        grade = grades.shift()
        comment = comments.shift()
        sendNotion("pages/", createGradePayload(presentation_id, grader_id, grade, comment), "POST")
    }
}