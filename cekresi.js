import axios from 'axios';

class TrackResi {
    constructor(resi) {
        this.resi = resi;

        this.globalHeaders = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'id-ID,id;q=0.9',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        };
    }

    async spx() {
        const url = 'https://spx.co.id/shipment/order/open/order/get_order_info';
        try {
            const { data } = await axios.get(url, {
                params: { spx_tn: this.resi, language_code: 'id' },
                headers: this.globalHeaders,
            });
            if (data?.data) {
                return { ekspedisi: 'SPX', data: data.data };
            }
            return null;
        } catch (error) {
            console.error('SPX Error:', error);
            return null;
        }
    }

    async tokped() {
        const url = `https://orchestra.tokopedia.com/orc/v1/microsite/tracking?airwaybill=${this.resi}`;
        const headers = {
            ...this.globalHeaders,
            'Referer': 'https://www.tokopedia.com/',
            'Origin': 'https://www.tokopedia.com',
            'Priority': 'u=1, i',
        };
        try {
            const { data } = await axios.get(url, { headers });
            if (data?.data?.[0]?.error_message === 'AWB Not Found') {
                return null;
            }
            return { ekspedisi: 'Tokopedia', data: data?.data };
        } catch (error) {
            console.error('Tokopedia Error:', error);
            return null;
        }
    }

    async jtCargo() {
        const url = 'https://office.jtcargo.co.id/official/waybill/trackingCustomerByWaybillNo';
        const data = { waybillNo: this.resi, searchWaybillOrCustomerOrderId: "1" };

        const headers = {
            ...this.globalHeaders,
            'Content-Type': 'application/json',
        };

        try {
            const response = await axios.post(url, data, { headers });
            if (response?.data?.data) {
                if (response.data.data[0].details.length > 0) {
                    return { ekspedisi: 'JTCargo', data: response.data };
                }
            }
            return null;
        } catch (error) {
            console.error('JTCargo Error:', error);
            return null;
        }
    }


    async run() {

        if (!this.resi) return { message: 'Silahkan input resi terlebih dahulu' }

        const methods = [
            { prefix: 'SPXID', method: this.spx.bind(this) },
            { prefix: 'TKP', method: this.tokped.bind(this) }
        ];

        for (let { prefix, method } of methods) {
            if (this.resi.startsWith(prefix)) {
                const result = await method();
                if (result) {
                    return { valid: true, ekspedisi: result.ekspedisi, data: result.data };
                }
            }
        }

        const allMethods = [this.spx(), this.tokped(), this.jtCargo()];
        for (let methodPromise of allMethods) {
            const result = await methodPromise;
            if (result) {
                return { valid: true, ekspedisi: result.ekspedisi, data: result.data };
            }
        }

        return { valid: false, message: 'Resi tidak dapat dilacak' };
    }
}


const resi = ''; // MASUKKAN RESI DISINI (STRING) 
const trackResi = await new TrackResi(resi).run();

console.log(trackResi)
