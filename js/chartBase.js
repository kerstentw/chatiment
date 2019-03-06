



// import chat_file
// read chat file
// format chat file
// grab prices based on chat
// create chart
// render chart

// Storage Variables

var state = {
  parser: "telegram",
  formatted_data: null,
  filtered_annotations: new Object
}

var PARSERS = {
    telegram: formatTelegram,
    kakao: formatKakao,
    whatsapp: formatWhatsapp,
    custom: formatCustom
}

// Helpers

function handleParserSelection(){
  $("#upload").show()
  state.parser = document.getElementById("parser").value
}


async function fetchData(_endpoint){
    let prices = await $.ajax(_endpoint)
    return prices
}

function normalizePricesForLine(_price_row) {
  /*
   close: "5756.98663"
   high: "5756.98663"
   low: "5630.13670"
   open: "5687.38078"
   timestamp: "2017-10-16T00:00:00Z"
   volume: "589315927"
  */

  return [new Date(_price_row.timestamp).getTime(), parseFloat(_price_row.close)]

}




function buildNomicsApiString(_starttime, _endtime){
  let starttime = _starttime
  let endtime = _endtime || new Date().toISOString()
  //return `https://api.nomics.com/v1/candles?key=a397325d785295fba75504e8059b5fba&interval=1m&currency=BTC&start=${starttime}&end=${endtime}`
  return `https://api.chatiment.io/quick?curr=BTC&start=${_starttime}&end=${_endtime}`
}

function grabPrices(_formatted_chat_struct){
  // format chat_struct
  buildNomicsApiString()
}


function calculateUserCounts() {
    let user_counts = new Object()
    let highest = [0,""]

    for (let i = 0; i < state.formatted_msgs.data.length; i++) {
      let sample = state.formatted_msgs.data[i]
      if (sample[0] && sample[1] && sample[2]) {
        user_counts[sample[1]]? user_counts[sample[1]] += 1 : user_counts[sample[1]] = 1
      }
    }

    let keys = Object.keys(user_counts)

    for (let i = 0; i < keys.length; i++) {
      let cur_key = keys[i]
      highest = user_counts[cur_key] > highest[0]? [user_counts[cur_key],cur_key] : highest
    }

    return [user_counts, highest]

}

function genDataBarHTML(_databar_obj){
  let generated = `
    <h5>SUMMARY</h5>
    <div class ="row">
    <table class="table col-md-6" style="font-size: 13px;">
      <tr>
        <th>
          Number of Messages
        </th>
        <td>
          ${_databar_obj.number_of_messages}
        </td>
      <tr>

      <tr>
        <th>
          First Message
        </th>
        <td>
        ${_databar_obj.first_message}
        </td>
      <tr>

      <tr>
        <th>
          Last Message
        </th>
        <td>
        ${_databar_obj.last_message}
        </td>
      <tr>

      <tr>
        <th>
          Most Talkative
        </th>
        <td>
          ${_databar_obj.prolific_user[1]}
        </td>
      <tr>
    </table>
    <div class="col-md-6">
      <a href="#user-pie" class="btn btn-info" style="margin-top: 50px" data-lity> Sentiment Breakdown </a>
    </div>
    </div>
    <div class= "lity-hide" id="user-pie"></div>
  `

  return generated

}

function generateDataBar(){
    user_info = calculateUserCounts()
    let data_store = {
          number_of_messages: state.formatted_msgs.data.length,
          first_message: state.formatted_msgs.start,
          last_message : state.formatted_msgs.end,
          user_counts : user_info[0],
          prolific_user: user_info[1]

    }

    return [genDataBarHTML(data_store),data_store]
}

function buildPricingMap(_pricing_struct) {
    let pricingMap = new Object()
    _pricing_struct.map((data)=>{pricingMap[data[0]] = [data[1],0,[]] }) //We will stash messages inside here; first bit is a float of price
    return pricingMap
}


function normalizeMsgs(_msg_row){
  try {
    return [new Date(_msg_row[0]).getTime(), _msg_row[1].replace(/\"/g,""), _msg_row[2].replace(/\"/g,"")] //This is where the stuff for making messages pretty will go
  } catch(err) {
    return _msg_row
  }
  window.alert("NOPE")
}

//////////////////////
// Formatting Logic //
//////////////////////


function formatWhatsapp(_txt_string) {
    //console.log("whap str:: ", _txt_string)
    const DATE_REGEX = /\d{1,2}\/\d{1,2}\/\d{1,2}, \d{1,2}:\d{1,2} [A-Z]{2}/
    const AUTHOR_REGEX = /(?<=-)(.*)(?=:)/
    const NON_DATE_AUTH = /\d{1,2}\/\d{1,2}\/\d{1,2}, \d{1,2}:\d{1,2} [A-Z]{2} - (.*):/
    let first_split =  _txt_string.split("\n")

    //Place in map function
    let formatted = first_split.map((data) => {
      let date = data.match(DATE_REGEX)? data.match(DATE_REGEX)[0]: null
      let sender = data.match(AUTHOR_REGEX)? data.match(AUTHOR_REGEX)[0]: null
      let body = data.replace(NON_DATE_AUTH,"")


      if (date && sender && body) {
        return [new Date(date).getTime(), sender.replace(" ",""), body]
      } else if (date){
        return [new Date(date).getTime(), sender || "WhatsApp System", body || "NO MESSAGE"]
      } else {
        return []
      }
    })

    let messages = {
                     data: formatted,
                     start: new Date(formatted[1][0]).toISOString(),
                     end: new Date(formatted[formatted.length - 2][0]).toISOString()
                    }
    //console.log("WHATS APP:: ", messages)
    return messages
}

function formatTelegram(_json_string) {

  telegram_obj = JSON.parse(_json_string)
  //console.log("TELE_OBJ", telegram_obj)
  formatted = telegram_obj.chats.list[0].messages.map(data=>[new Date(data.date).getTime(), data.actor || "(Hidden Name)", data.text])
  let messages = {
                   data: formatted,
                   start: new Date(formatted[1][0]).toISOString(),
                   end: new Date(formatted[formatted.length - 2][0]).toISOString()
                  }

  return messages
}


function formatCustom(_csv_string){
  return formatKakao(_csv_string)
}

function formatKakao(_csv_string) {
  let splitted = _csv_string.split("\n").map(data=>data.split(","))
  let formatted = splitted.map(data => normalizeMsgs(data))
  //console.log("formatted",formatted)

  //window.alert(formatted[formatted.length - 1])
  let messages = {
                   data: formatted,
                   start: new Date(formatted[1][0]).toISOString(),
                   end: new Date(formatted[formatted.length - 2][0]).toISOString()
                  }

  return messages

}

// Collapse Functions - THIS IS THE JUICE

function groupMessagesToPrices(_messages, _price_map){

    let price_keys = Object.keys(_price_map).map(data=>parseInt(data)).sort()
    //console.log(price_keys)
    for (let msg_idx = 0; msg_idx < _messages.length; msg_idx++){

      var msg_timestamp = _messages[msg_idx][0]

      if (msg_timestamp) {
        var previous_offset = 0; // will always be a timestamp in the price_keys

        for (let price_idx = 0; price_idx < price_keys.length; price_idx++) {
          let price_timestamp = price_keys[price_idx]
          let t_offset = price_timestamp - msg_timestamp

          if (t_offset > 0){
            _price_map[price_keys[price_idx]][2].push(_messages[msg_idx])
            _price_map[price_keys[price_idx]][1] = _price_map[price_keys[price_idx]][2].length

            break
          } else {
            previous_frame = price_keys[price_idx]
          }
        }
      } else {
        continue
      }
    }

}

function grabChats(_key){
  let chatData = state.price_msg_map[_key][2]
  let chat_html = chatData.map((data)=>{
    return `
        <div class="chat-msg">
          <span class="msg_author">${data[1]}</span><br/>
          <span class="msg_content">${data[2]}</span><br/><br/>
          <span class="msg_date">${new Date(data[0]).toISOString()}</span>
        </div>
        `
  })

  $(".chat_hist").html(chat_html.join("<br/>"))
}

function buildAnnotationsFromPriceMap(_price_map){
  /*
  ["2017-10-14 17:38:40", ""TK"", ""TK joined this chatroom.""]

  =>

      {
          point: {
              xAxis: 0,
              yAxis: 0,
              x: 159,   // This is a price at this coordinate
              y: 443    //This is a pricingMap point
          },
          text: 'Saint-Claude'
      }
  */

  //console.log("PR_MAP::: ", _price_map)
  let keys = Object.keys(_price_map).sort()

  let mapped_keys = keys.map((key)=>{
      //console.log()
      return {
        draggable: "",
        className: String(`msg-annotation anno_${key}`),
        text: `<a onClick="grabChats(${key})">${String(_price_map[key][1])} msgs.</a>`,
        crop: true,
        point : {
          x: parseInt(key),
          y: _price_map[key][0],
          xAxis: 0, // ???
          yAxis: 0, // ????
        }
      }
  })
  return mapped_keys
}

// Chart Logic & State Managers
// TODO: Refactor this into something more comprehensible

function drawPie(){

  let sample = ""
  Highcharts.chart('user-pie', {
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
    },
    title: {
        text: `MESSAGE DISTRIBUTIONS`
    },
    tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                style: {
                    color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                }
            }
        }
    },
    series: [{
        name: 'USERS',
        colorByPoint: true,
        data: Object.keys(state.databar_obj[1].user_counts).map((key) => {
          return {
          y: state.databar_obj[1].user_counts[key],
          name: key
        }

         })
    }]
});
}

function drawChart(_state) {
    let prices = state.prices.map(data=>normalizePricesForLine(data))
    state.price_msg_map = buildPricingMap(prices)
    groupMessagesToPrices(state.formatted_msgs.data, state.price_msg_map)
    let annotations = buildAnnotationsFromPriceMap(state.price_msg_map)
    CHART_CONFIG.addData(prices)
    CHART_CONFIG.addAnnotations(annotations)

    Highcharts.stockChart('annotated_chart', CHART_CONFIG)
    $(".loader_gif").hide()
    $(".placeholder_chart").hide()

    state.databar_obj = generateDataBar()
    $("#databar").show()
    $(".data_table").html(state.databar_obj[0])

    //console.log("DATABAR", state.databar_obj[1])
    //console.log("FINAL STATE:::", state)
    drawPie()

}


function buildChart(evt) {
    $(".chart_container").show()
    $(".loader_gif").show()

    var files = evt.target.files; // FileList object
    f = files[0];
    var reader = new FileReader();


    reader.onload = (function(theFile) {
        return async function(e) {
          try {
            state.formatted_msgs = PARSERS[state.parser](e.target.result)
          } catch(err) {
            //console.log("Caught error", err)
            window.alert(`Please select a valid ${state.parser} export file`)
            $(".loader_gif").hide()

            return
          }
          state.price_endpoint = buildNomicsApiString(state.formatted_msgs.start, state.formatted_msgs.end)
          state.prices = JSON.parse(await fetchData(state.price_endpoint))
          drawChart(state)
        };
    })(f);

    // Read in the image file as a data URL.
    reader.readAsText(f);
  }
