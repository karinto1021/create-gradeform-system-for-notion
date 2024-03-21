function getLastLine(sheet){
    var datas = []
    var lastRow = sheet.getLastRow()//最後の行
    // var lastColumn = sheet.getLastColumn()//最後の列
    // var datasFromsheet = sheet.getRange(lastRow, 1, 1, lastColumn).getValues()[0]
    var cell = sheet.getRange(lastRow, 1)

    while (cell.offset(0,1).getValue() != ""){
        datas.push(cell.getValue())
        cell = cell.offset(0,1)
    }
    datas.push(cell.getValue())

    return datas
}

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

function testPageID() {
    return scriptPropertyFor("TEST_PAGE_ID")
}

function testPageID2() {
    return scriptPropertyFor("TEST_PAGE_ID2")
}

function presenterDatabaseID() {
    return scriptPropertyFor("PRESENTER_DATABASE_ID")
}

function answerSheetID() {
    return scriptPropertyFor("ANSWER_SHEET_ID")
}

// スクリプトプロパティにデータを保存
function saveScriptPropertyTo(key, value) {
    PropertiesService.getScriptProperties().setProperty(key, value)
}

// 現在のアクティブシートを得る
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

// Create Page API を呼び出す
function createPage(payload) {
    return sendNotion("pages", payload, "POST")
}

// Update Page API を呼び出す
function updatePage(page_id, payload) {
    return sendNotion("pages/" + page_id, payload, "PATCH")
}

// Retrieve Page API を呼び出す
function getPage(page_id) {
    return sendNotion("pages/" + page_id, null, "GET")
}

function unique(array) {
    return array.filter((x, i) => array.indexOf(x) === i);
}

function getPresenters() {
    next = undefined
    has_more = true
    presenters_data = []

    while(has_more){

        payload = {
            start_cursor: next
        }

        let datas = sendNotion("databases/" + presenterDatabaseID() + "/query?filter_properties=DO%5Ce&filter_properties=title", payload, "POST")

        next = datas.next_cursor
        has_more = datas.has_more

        for(let data of datas.results){
            presenters_data.push(data)
        }

    }

    return presenters_data.reduce(
            (h, p) => {
                h[p.id] = [p.properties.名前.title[0].text.content, p.properties.所属.rich_text[0].text.content]
                return h
            }, {}
        )


    // presenters_data = sendNotion("databases/" + presenterDatabaseID() + "/query?filter_properties=DO%5Ce&filter_properties=title", null ,"POST")
    // // presenters_data[0]

    // return presenters_data.results.reduce(
    //     (h, p) => {
    //         h[p.id] = [p.properties.名前.title[0].text.content, p.properties.所属.rich_text[0].text.content]
    //         return h
    //     }, {}
    // )
}

// presentationのdatabaseからspreadsheetにデータを追加
function addPresentationDataToSheet(presentation_data, presenters, sheet, add_row, add_col){

    // console.log(presentation_data)
    data_properties = presentation_data.properties

    number = data_properties.発表番号.number.toFixed()
    date = data_properties.発表日.rich_text[0].text.content
    time = data_properties.発表時間.rich_text[0].text.content
    title = data_properties.発表タイトル.rich_text[0].text.content

    presenter_id = data_properties.発表者.relation[0].id

    presenter_name = presenters[presenter_id][0].split("_")[0]
    affiliation = presenters[presenter_id][1]

    add_data = '(' + number + '),' + date + ',' + time + ',' + title + ',' + affiliation + ',' + presenter_name

    sheet.getRange(add_row, add_col).setValue(add_data)

}

// program_page_idから(その月の)propertiesを取得
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

    return sendNotion("databases/" + presentationDatabaseID() + "/query", payload ,"POST").results
}

// function getAuthor(presentation_page_id, property_id){

//     json =  sendNotion("pages/" + presentation_page_id + "/properties/" + property_id, null ,"GET")
//     console.log(json)
//     return json.results[0]
// }

function addAllPresentationDataToSheet(program_page_id, program_month, sheet){
    add_row = sheet.getLastRow() + 1
    add_col = 1

    sheet.getRange(add_row, add_col).setNumberFormat('@');
    sheet.getRange(add_row, add_col++).setValue(program_month);

    presenters = getPresenters()

    presentations = getPresentationFromProgram(program_page_id)
    
    for(let presentation of presentations){
        addPresentationDataToSheet(presentation, presenters, sheet, add_row, add_col++)
        // console.log('added')
    }
}

function getProgramData(){
    return sendNotion("databases/" + programDatabaseID() + "/query", null ,"POST")
}

function createProgramIDHash(program_data){
    return program_data.results.reduce(
        (h, p) => {
            h[p.properties.実施月.title[0].plain_text] = p.id
            return h
        }, {}
    )
}

function getAddProgramID(sheet){
    program_data = getProgramData()
    // sendNotion("databases/" + programDatabaseID() + "/query", null ,"POST")

    month_id = createProgramIDHash(program_data)
    // programs_data.results.reduce(
    //     (h, p) => {
    //         h[p.properties.実施月.title[0].plain_text] = p.id
    //         return h
    //     }, {}
    // )

    // databaseには全ての月がある
    months_db = program_data.results.reduce(
        (h, p) => {
            h.push(p.properties.実施月.title[0].plain_text)
            return h
        },[]
    )

    // sheetには追加されている月しかない
    months_sheet = getColumnValues(sheet,1)
    // getAddedMonthsとmonth_idを比較して、追加されていない月のprogram_page_idを返す
    var addProgramID = []
    var addProgramMonth = []

    for(let month_db of months_db){
        // console.log(month_sheet[0])
        if(!months_sheet.includes(month_db)){
            addProgramID.push(month_id[month_db])
            addProgramMonth.push(month_db)
            // console.log(month_sheet[0])
        }
    }

    var ans = []
    ans.push(addProgramID)
    ans.push(addProgramMonth)

    return ans
}

function getColumnValues(sheet,n){
    last_row = sheet.getLastRow()

    values = []

    for(let i = 1; i <= last_row; i++){
        values.push(sheet.getRange(i, n).getValue())
    }

    return values
}

function getPresentationDataFromSheet(sheet){
    datas = getLastLine(sheet)
    datas.shift()
    return datas
}

function create_form_based(year, month, numbers, dates, times, titles, affiliations, presenters, formKey, n = 1){
    // 本体で書いてあるのをここに移行
    // if(!n){
    //     n = 1
    // }

    // formを作成
    var form_name = 'マイクロ波研究会学生研究発表賞 採点表' + year + '年' + month + '月'+ n + '日目'
    var form = FormApp.create(form_name);

    // form.setRequireLogin(false)
    form.setLimitOneResponsePerUser(true)
    form.setShowLinkToRespondAgain(false)
    form.setCollectEmail(true)
    form.setDestination(FormApp.DestinationType.SPREADSHEET, answerSheetID())

    var formTitle = form_name;
    const formDescription = '別紙の採点ガイドラインに従い、\nA. 発表内容の新規性、\nB. 発表内容の信頼性、\nC. 発表内容の完成度、\nD. パワーポイントのまとまり、\nE. プレゼンテーションの質と時間、\nF. 質疑応答に対する態度、\nの各項目につき１０点満点（５点を基準として）で評価をお願い致します。\n\n同一組織、共著などの関連論文は採点されないようお願いいたします。\n\n確認事項：以下の場合は全評価項目を　0　としてください。\n・講演者が筆頭著者本人でない場合\n・同一組織に所属する講演者の場合\n・その他の事情で評価しない場合\n\nこの採点フォームは一度送信すると編集はできません。ご了承ください。\n\n表彰に関する諸規則は以下のリンクをご確認ください。\nhttps://www.ieice.org/~mw/about/MW_Student_study_excellent_announcement_prize_recommendation_regulation20210520.pdf'    
    // form.collectsEmail()

    //最初のタイトルを設定
    form.setTitle(formTitle)
    form.setDescription(formDescription)

    // 回答がどのprogramかわかるようにprogramIDを記述しておく
    // form.addTextItem().setTitle('システムで使用するので編集しないでください。').setRequired(true)

    form.addSectionHeaderItem().setTitle('まず上記のメールアドレスと採点者の氏名、所属、役職をご入力ください。')
    form.addTextItem().setTitle('氏名\n(フルネームで入力し、姓と名の間にスペースを入れないでください。)').setRequired(true)
    form.addTextItem().setTitle('所属').setRequired(true)
    form.addMultipleChoiceItem().setTitle('役職').setChoiceValues(['座長・月担当','委員長・副委員長','幹事・幹事補佐','教育', '専門委員']).setRequired(true)
    // form.addTextItem().setTitle('メールアドレス').setRequired(true).setValidation(FormApp.createTextValidation().requireTextIsEmail().build())

    // 回答用オブジェクト
    var formResponse = form.createResponse()
    // var endQuestions = []

    // 全てのセクションを追加
    for(var i=0; i < numbers.length; i++){
        var section = form.addPageBreakItem().setTitle(numbers[i])
        const TimeDescription = '時間 : ' + dates[i] + ' ' + times[i] + '\n\n'
        const TitleDescription = 'タイトル : ' + titles[i] + '\n\n'
        const AffiliationDescription = '所属 : ' + affiliations[i] + '\n\n'
        const PresenterDescription = '発表者 : ' + presenters[i]
        const sectionDescription = TimeDescription + TitleDescription + AffiliationDescription + PresenterDescription
        section.setHelpText(sectionDescription)

        // 回答なし
        form.addScaleItem().setTitle('内容の新規性(A)(10点)').setBounds(0, 10).setRequired(true)
        form.addScaleItem().setTitle('内容の信頼性(B)(10点)').setBounds(0, 10).setRequired(true)
        form.addScaleItem().setTitle('内容の完成度(C)(10点)').setBounds(0, 10).setRequired(true)
        form.addScaleItem().setTitle('スライドの出来(D)(10点)').setBounds(0, 10).setRequired(true)
        form.addScaleItem().setTitle('プレゼンの質と時間(E)(10点)').setBounds(0, 10).setRequired(true)
        form.addScaleItem().setTitle('質疑応答(F)(10点)').setBounds(0, 10).setRequired(true)
        
        // 回答つき
        // formResponse.withItemResponse(form.addScaleItem().setTitle('内容の新規性(A)(10点)').setBounds(0, 10).setRequired(true).createResponse(0))
        // formResponse.withItemResponse(form.addScaleItem().setTitle('内容の信頼性(B)(10点)').setBounds(0, 10).setRequired(true).createResponse(0))
        // formResponse.withItemResponse(form.addScaleItem().setTitle('内容の完成度(C)(10点)').setBounds(0, 10).setRequired(true).createResponse(0))
        // formResponse.withItemResponse(form.addScaleItem().setTitle('スライドの出来(D)(10点)').setBounds(0, 10).setRequired(true).createResponse(0))
        // formResponse.withItemResponse(form.addScaleItem().setTitle('プレゼンの質と時間(E)(10点)').setBounds(0, 10).setRequired(true).createResponse(0))
        // formResponse.withItemResponse(form.addScaleItem().setTitle('質疑応答(F)(10点)').setBounds(0, 10).setRequired(true).createResponse(0))

        // コメント
        form.addTextItem().setTitle('コメント\n講評のときに使用しますので特にいい部分につき記入をお願いします').setRequired(false)
        

        // 全てのセクションの最後に採点を終了するかの質問(選ぶ！！)
        // endQuestions.push(form.addMultipleChoiceItem().setTitle('本日分の採点を終了しますか？').setRequired(true))
    }

    form.addPageBreakItem().setTitle('ご回答ありがとうございました。\n採点結果を送信すると回答の編集はできません。ご注意ください。\n以下はシステムで使用するので書き換えずこのままご送信ください。')
    // formResponse.withItemResponse(form.addTextItem().setTitle('システムで使用するので編集しないでください。\nもし編集してしまった場合は以下の文字列をコピーして送信してください。\n' + formKey).setRequired(true).createResponse(formKey))
    formResponse.withItemResponse(form.addTextItem().setTitle('システムで使用するので編集しないでください。').setRequired(true).createResponse(formKey))
    formResponse.withItemResponse(form.addTextItem().setTitle('システムで使用するので編集しないでください。').setRequired(true).createResponse(n))

    // 採点を終了するかの質問を追加した時、'はい'で最後のページに飛べるようにする(選ぶ！！)
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    // var last = form.addPageBreakItem().setTitle('ご回答ありがとうございました。')

    // for(let question of endQuestions){
    //     question.setChoices([
    //         question.createChoice('はい', last),
    //         question.createChoice('いいえ', FormApp.PageNavigationType.CONTINUE)
    //     ])
    //     formResponse.withItemResponse(question.createResponse('いいえ'))
    // }
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    // console.log(formResponse.toPrefilledUrl())
    // Logger.log('Published URL: ' + form.getPublishedUrl());

    var ans = {form: form, url: formResponse.toPrefilledUrl()}

    return ans
}

function doGet(e){
    var result;
    switch(e.parameter.test){
        case "1":
            let template;
            // Notionからデータを取得しSheetに書き込む
            // sheetに追加する月のデータがないときはerror
            if(get_programdata_from_notion() == 0){
                // Sheetからデータを取得し、採点用Google Formを作成する
                urls = create_grade_googleform();

                // 生成したurlsを表示する
                template = HtmlService.createTemplateFromFile('list');
                template.urls = urls;
                result = template.evaluate();
            }else{
                result = HtmlService.createHtmlOutputFromFile('error');
            }
             break;
        case "2":
            var sheet = getSheet();
            var lastRow = sheet.getLastRow();
            sheet.deleteRow(lastRow);
            result = HtmlService.createHtmlOutputFromFile('delete');
            break;
    }
    return result;
}

// function doGet(){
//     urls = create_grade_googleform();
//     // urls = ["aaaa", "bbbb"];
//     let template = HtmlService.createTemplateFromFile('list');
//     template.urls = urls;
//     return template.evaluate();
// }

// デプロイのリンク
// https://script.google.com/macros/s/AKfycbyYfK1VEllDHtSYyN99_Up0M_Yc7n6mNYKUmAyC3iEqtXmUG8PGncCrE3ZoyQ-FV6waVA/exec