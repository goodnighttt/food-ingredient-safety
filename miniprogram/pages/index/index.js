Page({
  data: {
    tempImagePath: ''
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        this.setData({
          tempImagePath: res.tempFiles[0].tempFilePath
        })
      }
    })
  },

  analyzeImage() {
    if (!this.data.tempImagePath) {
      wx.showToast({
        title: '请先上传图片',
        icon: 'none'
      })
      return
    }
  
    wx.showLoading({
      title: '正在分析...',
    })
  
    wx.cloud.uploadFile({
      cloudPath: `ocr/${Date.now()}.png`,
      filePath: this.data.tempImagePath,
      success: res => {
        wx.cloud.callFunction({
          name: 'baiduOCR',
          data: {
            fileID: res.fileID
          }
        }).then(result => {
          wx.hideLoading()
          if (result.result.code === 0) {
            const ocrResult = result.result.data.words_result
            
            let fullText = ocrResult.map(item => item.words).join('')
            
            let match = fullText.match(/配料[：:](.*?)。/)
            if (match && match[1]) {
              let ingredients = match[1].split(/[、，,]/).map(item => item.trim())
              
              ingredients = ingredients.filter(item => item.length > 0)
              
              console.log('提取到的配料：', ingredients)
              
              this.setData({
                ingredients: ingredients
              })
            } else {
              wx.showToast({
                title: '未找到配料信息',
                icon: 'none'
              })
            }
          } else {
            wx.showToast({
              title: '识别失败',
              icon: 'none'
            })
          }
        }).catch(err => {
          wx.hideLoading()
          wx.showToast({
            title: '识别失败',
            icon: 'none'
          })
          console.error(err)
        })
      },
      fail: err => {
        wx.hideLoading()
        wx.showToast({
          title: '上传图片失败',
          icon: 'none'
        })
        console.error(err)
      }
    })
  }
})