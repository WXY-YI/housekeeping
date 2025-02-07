import { storeBindingsBehavior } from 'mobx-miniprogram-bindings'
import { timStore } from '../../../../store/tim'
import { getEventParam } from '../../../../utils/util'
import TIM from 'tim-wx-sdk-ws'
import { Tim } from '../../../../models/tim'

Component({

    properties: {
        targetUserId: String,
        service: Object
    },

    data: {
        text: '',
        scrollHeight: 0
    },

    behaviors: [storeBindingsBehavior],

    storeBindings: {
        store: timStore,
        fields: ['messageList', 'intoView', 'isCompleted'],
        actions: ['getMessageList', 'setTargetUserId', 'scrollMessageList']
    },

    lifetimes: {
        async attached () {
            this._setNavigationBarTitle()
            await this._setScrollHeight()
            this.setTargetUserId(this.data.targetUserId)
            await this.getMessageList()
            if (this.data.service) {
                const message = Tim.getInstance().createMessage(TIM.TYPES.MSG_CUSTOM, this.data.service, this.data.targetUserId, 'link')
                this.pushMessage(message)
            }

        }
    },

    methods: {
        handleSendList (event) {
            const service = getEventParam(event, 'service')
            this.triggerEvent('sendmessage', {
                type: TIM.TYPES.MSG_CUSTOM,
                content: service
            })
        },

        handleSelect () {
            const service = getEventParam(event, 'service')
            wx.navigateTo({
                url: `/pages/service-detail/service-detail?service_id=${service.id}`
            })
        },

        async handleSendImage () {
            const res = await wx.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['album', 'camera']
            })

            this.triggerEvent('sendmessage', {
                type: TIM.TYPES.MSG_IMAGE,
                content: res
            })
        },

        handleInput (event) {
            this.data.text = getEventParam(event, 'value')
        },

        handleSend () {
            const text = this.data.text.trim()
            if (text === '') {
                return
            }

            this.triggerEvent('sendmessage', {
                type: TIM.TYPES.MSG_TEXT,
                content: text
            })

            this.setData({
                text: ''
            })
        },

        handleScrolltoupper () {
            if (this.data.isCompleted) {
                return
            }
            wx.showLoading({ title: '正在加载...', mask: true })
            this.scrollMessageList()
            setTimeout(() => {
                wx.hideLoading()
            }, 1000)
        },

        async _setScrollHeight () {
            const systemInfo = await wx.getSystemInfo()
            const scrollHeight = systemInfo.windowHeight - (systemInfo.safeArea.bottom) - 95
            this.setData({ scrollHeight })
        },

        async _setNavigationBarTitle () {
            const res = await Tim.getInstance().getUserProfile(this.data.targetUserId)
            wx.setNavigationBarTitle({ title: res[0].nick || '慕慕到家' })
        }
    }
})
