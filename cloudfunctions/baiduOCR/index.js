const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 配置百度API密钥
const AK = "yeAPmPc7NnwT11QU7ZDTaFuH"
const SK = "2lI5Ppk2zeXVyQHLGSSqdhSybDfUVh5U"

// 获取百度API访问令牌
async function getAccessToken() {
  const options = {
    'method': 'POST',
    'url': `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${AK}&client_secret=${SK}`,
  }
  
  try {
    const res = await axios(options)
    return res.data.access_token
  } catch (error) {
    console.error('获取access_token失败：', error)
    throw error
  }
}

// 图片转Base64
async function getImageBase64(fileID) {
  try {
    const res = await cloud.downloadFile({
      fileID: fileID,
    })
    const buffer = res.fileContent
    return buffer.toString('base64')
  } catch (error) {
    console.error('图片转Base64失败：', error)
    throw error
  }
}

// 主函数
exports.main = async (event, context) => {
  try {
    // 获取access_token
    const accessToken = await getAccessToken()
    
    // 获取图片base64编码
    const imageBase64 = await getImageBase64(event.fileID)
    
    // 调用百度OCR API
    const options = {
      'method': 'POST',
      'url': `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${accessToken}`,
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      'data': `image=${encodeURIComponent(imageBase64)}`
    }

    const response = await axios(options)
    return {
      code: 0,
      data: response.data
    }

  } catch (error) {
    console.error('OCR识别失败：', error)
    return {
      code: -1,
      error: error.message
    }
  }
}