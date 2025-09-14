import axios from 'axios';
import qs from 'qs';

class TrackResi {
    constructor(resi, phone) {
        this.resi = resi;
        this.phone = phone;

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
                if (response.data.data[0]?.details?.length > 0) {
                    return { ekspedisi: 'JTCargo', data: response.data };
                }
            }
            return null;
        } catch (error) {
            console.error('JTCargo Error:', error);
            return null;
        }
    }



    async jnt() {

        const url = 'https://jet.co.id/index/router/index.html';

        const data = qs.stringify({
            method: 'query/findTrack',
            'data[billcode]': this.resi,
            'data[lang]': 'en',
            'data[source]': '3',
            'data[phone]': this.phone?.slice(-4),
            'data[type]': '1',
            pId: 'a6a78ea1e8e8a30262293adf5a6c2c49',
            pst: '311e78c3bdb5123322aac20525a12f75',
        });

        const headers = {
            ...this.globalHeaders,
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Referer': `https://jet.co.id/track?bills=${this.resi}`,
            'Origin': 'https://jet.co.id',
            'X-Requested-With': 'XMLHttpRequest',
            'x-simplypost-id': 'a6a78ea1e8e8a30262293adf5a6c2c49',
            'x-simplypost-signature': '311e78c3bdb5123322aac20525a12f75',
            'Cookie': 'HWWAFSESID=f5352731a19f61bb9d; HWWAFSESTIME=1757813060846; think_var=en-us; PHPSESSID=k3607artrueth3i1c2kep4uv45; _gid=GA1.3.878583306.1757813069; _gat_gtag_UA_158512495_1=1; _ga_HTHK2WZJ0T=GS2.1.s1757813069$o1$g1$t1757813110$j19$l0$h0; _ga=GA1.1.1628943577.1757813069'
        };

        try {
            let response = await axios.post(url, data, { headers });
            response = JSON.parse(response.data);
            if (response?.success) {
                return { ekspedisi: 'J&T', data: (response.data) };
            }
            return null;
        } catch (error) {
            console.error('J&T Error:', error.response?.data || error.message);
            return null;
        }
    }

    async run() {
        if (!this.resi) return { message: 'Silahkan input resi terlebih dahulu' }
        if (!this.phone) return { message: 'Nohp diperlukan' }
        if (!this.phone.startsWith('08')) return { message: 'Format nohp 08xxx' }

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

        const allMethods = [
            this.spx(),
            this.tokped(),
            this.jtCargo(),
            this.jnt() 
        ];

        for (let methodPromise of allMethods) {
            const result = await methodPromise;
            if (result) {
                return { valid: true, ekspedisi: result.ekspedisi, data: result.data };
            }
        }

        return { valid: false, message: 'Resi tidak dapat dilacak' };
    }
}


const resi = ''; // Ganti dengan resi kamu
const nohp = ''; // Ganti dengan nohp kamu

const trackResi = await new TrackResi(resi,nohp).run();

console.log(trackResi);
