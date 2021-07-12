import { promisic } from './util'
import APIConfig from '../config/api'
import { Http } from './http'

class FileUploader extends Http {
    static async upload (filePath, key = 'file') {
        let res
        try {
            res = await promisic(wx.uploadFile)({
                url: `${APIConfig.baseUrl}/v1/file`,
                filePath,
                name: key
            })
        } catch (e) {
            FileUploader._showError(-1)
            throw Error(e.errMsg)
        }

        const serverData = JSON.parse(res.data)

        if (res.statusCode !== 201) {
            FileUploader._showError(serverData.error_code, serverData.message)
            throw Error(serverData.message)
        }

        return serverData.data
    }
}

export { FileUploader }