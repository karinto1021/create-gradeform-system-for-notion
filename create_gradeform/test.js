function test() {
    // スプレッドシートからデータを取得
    const ss = SpreadsheetApp.getActiveSpreadsheet()
    // const sheet = ss.getSheetByName('test')
    const sheet = ss.getSheetByName('2022')


    // var presenter_data
    // var numbers = []
    // var dates = []
    // var times = []
    // var titles = []
    // var affiliations = []
    // var presenters = []

    // 特定のセルを取得
    // var range = sheet.getRange('A2')

    // 複数セルを取得
    // var ranges = sheet.getRange('A2:B3')

    // セルのデータを取得
    // var value = range.getValue()

    // 複数セルのデータを取得
    // var values = ranges.getValues()

    ///////////////////////////////////////////////////
    // 行全体を取得できるようにする
    // var lastRow = sheet.getLastRow()//最後の行
    // var lastColumn = sheet.getLastColumn()//最後の列
    // var datasFromsheet = sheet.getRange(lastRow, 1, 1, lastColumn).getValues()[0]

    // datasFromsheet.forEach(function(data){
    //     numbers.push(data.split(",")[0])
    //     dates.push(data.split(",")[1])
    //     times.push(data.split(",")[2])
    //     titles.push(data.split(",")[3])
    //     affiliations.push(data.split(",")[4])
    //     presenters.push(data.split(",")[5])
    // })

    //////////////////////////////////////////////////////////
    //google formを取得し編集

    // ここから
    // var formid = '1zD_-C-ePqVGIRcH4WLwUIjcd2vfFeTgF6ka7YykxQZk'//編集のform id
    // const form = FormApp.openById(formid)

    // var formTitle = 'マイクロ波研究会学生研究発表賞 採点表 2022年度3月'
    // const formDescription = '別紙の採点ガイドラインに従い、\nA. 発表内容の新規性、\nB. 発表内容の信頼性、\nC. 発表内容の完成度、\nD. パワーポイントのまとまり、\nE. プレゼンテーションの質と時間、\nF. 質疑応答に対する態度、\nの各項目につき１０点満点（５点を基準として）で評価をお願い致します。\n\n同一組織、共著などの関連論文は採点されないようお願いいたします。\n\n確認事項：講演者は筆頭著者本人でない場合は下記項目に点をつけずに、合計点は　0　としてください。\n(すべての点数に0を入力してください)\n\n採点終了後、採点表を宮田宛（miyata@metro-cit.ac.jp）にご送付ください。'

    // form.setTitle(formTitle)
    // form.setDescription(formDescription)

    // form.addTextItem().setTitle('氏名').setRequired(true)
    // form.addTextItem().setTitle('所属').setRequired(true)
    // form.addTextItem().setTitle('メールアドレス').setRequired(true).setValidation(FormApp.createTextValidation().requireTextIsEmail().build())
    // ここまでmodifyへ移行

    // Logget.log(form.getDescription())




    
    // ログに出力
    // Logger.log(numbers)
    // Logger.log(dates)
    // Logger.log(times)
    // Logger.log(titles)
    // Logger.log(affiliations)
    // Logger.log(presenters)

    //変数の型確認 
    // Logger.log(Logger.log(Object.prototype.toString.call(datas)))

//////////////////////////////////////////////////
// NotionからAPIでデータを取得

    // // Logger.log(getPage(testPageID()).properties.発表タイトル.rich_text[0].text.content)
    // add_row = sheet.getLastRow() + 1
    // add_col = 2

    // presenters = getPresenters()

    // pages = [getPage(testPageID()), getPage(testPageID2())]

    // addPresentationToSheet(pages[0], presenters, sheet, add_row, add_col++)
    // addPresetntationToSheet(pages[1], presenters, sheet, add_row, add_col)
    // addPresetntationToSheet(testPageID2(), add_row, add_col, presenters)
    // console.log(getPresenters())

// Logger.log(getPage(programDatabaseID()))

    // presentations = getPresentationFromProgram("5521a521c0724ac99d5cda5160e2a618")

    // presentations.forEach(function(presentation){
    //     addPresentationToSheet(presentation, presenters, sheet, add_row, add_col++)
    // })

    // for(let presentation of presentations){
    //     addPresentationToSheet(presentation, presenters, sheet, add_row, add_col++)
    // }
    // addPresentationToSheet(presentations[0], presenters, sheet, add_row, add_col++)

    // console.log(getPresenters())
    // getAddedMonths(sheet)
    // console.log(getColumnValues(sheet, 2))
    // console.log(getAddProgramID(sheet))
    // console.log(getColumnValues(sheet, 2))
    // console.log(getPresentationDataFromSheet(sheet))
    // data = getLastLine(sheet)
    // month = data.shift()
    // console.log(data)
    // console.log(month)

    // programs_data = getProgramData()
    // month_id = createProgramIDHash(programs_data)
    // // sendNotion("databases/" + programDatabaseID() + "/query", null ,"POST")

    // month_id = programs_data.results.reduce(
    //     (h, p) => {
    //         h[p.properties.実施月.title[0].plain_text] = p.id
    //         return h
    //     }, {}
    // )

    // console.log(month_id[month])

    // url = create_grade_googleform()
    // // console.log(url)

    // id = getAddProgramID(sheet);
    // console.log(id)
    // if (id[0].length != 0) {
    //     console.log("ok")
    // } else {
    //     console.log("no")
    // }

    // a = [1,2,3,3,4,5,5,8]
    // console.log(unique(a))
    // console.log(a)

    // console.log(get_programdata_from_notion())
    console.log("urls = " + create_grade_googleform())
}

