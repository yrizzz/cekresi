import axios from 'axios';

class TrackResi {
    constructor(resi) {
        this.resi = resi;
    }

    async spx() {
        const url = 'https://spx.co.id/shipment/order/open/order/get_order_info';
        try {
            const { data } = await axios.get(url, {
                params: { spx_tn: this.resi, language_code: 'id' },
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept-Language': 'id-ID,id;q=0.9',
                    'Sec-Ch-Ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
                    'Sec-Ch-Ua-Mobile': '?0',
                    'Sec-Fetch-Site': 'same-origin',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Dest': 'empty',
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
                    'Referer': 'https://spx.co.id/track?SPXID052542346665',
                    'Cookie': 'app_lang=id; _gcl_au=1.1.1890430435.1757512615; _med=refer; _ga=GA1.1.65444017.1757512616; _ga_3CRNHSSGVR=GS2.1.s1757512615$o1$g1$t1757512616$j59$l0$h0'
                },
            });
            return data?.data;
        } catch (error) {
            console.error('SPX Error:', error);
            return null;
        }
    }

    async cekResiTokopedia() {
        const url = `https://orchestra.tokopedia.com/orc/v1/microsite/tracking?airwaybill=${this.resi}`;

        const headers = {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'id-ID,id;q=0.9',
            'Sec-Ch-Ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Fetch-Site': 'same-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
            'Referer': 'https://www.tokopedia.com/',
            'Origin': 'https://www.tokopedia.com',
            'Priority': 'u=1, i',
        };

        try {
            const response = await axios.get(url, { headers });
            return response.data?.data;
        } catch (error) {
            console.error('Error tracking resi Tokopedia:', error);
            throw error;
        }
    }

    async run() {
        if (this.resi.startsWith('SPXID')) {
            const spxData = await this.spx();
            return { valid: true, ekspedisi: 'SPX', data: spxData };
        }

        if (this.resi.startsWith('TKP')) {
            const tkData = await this.cekResiTokopedia();
            return { valid: true, ekspedisi: 'Rekomendasi Tokopedia', data: tkData };
        }

        return { valid: false, message: 'Resi tidak dapat dilacak' };
    }
}


const trackResi = await new TrackResi('RESIMU').run();
console.log(trackResi)