import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.45/vue.esm-browser.prod.min.js';

const app = {
    data() {
        return {
            apiUrl: "https://vue3-course-api.hexschool.io/v2",
            apiPath: "truth",
            currentPage: "./Vue-W3/products.html",
            targetPage: "./Vue-W3/products.html",
            repatriationPage: "./Vue-W3/login.html",
            products: [],
            productTemplate: {},
            productEmptyTemp: {
                "title": "",
                "category": "",
                "origin_price": 0,
                "price": 0,
                "unit": "",
                "description": "",
                "content": "",
                "is_enabled": 1,
                "imageUrl": "",
                "imagesUrl": []
            },
            productId: ""
        }
    },
    methods: {
        login() {

            const signinInfo = {
                "username": document.querySelector("#username").value,
                "password": document.querySelector("#password").value
            }

            axios.post(`${this.apiUrl}/admin/signin`, signinInfo)
                .then(res => {
                    document.cookie = `token=${res.data.token};expires=${res.data.expired}`
                    location.href = this.targetPage;
                }).catch(err => {
                    console.log(err)
                    if (err.data.message = "登入失敗") {
                        alert("登入失敗,帳號或密碼錯誤,請重新輸入")
                    }
                })
        },
        check() {
            if (location.pathname === this.currentPage) {
                const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
                axios.defaults.headers.common['Authorization'] = token;
                axios.post(`${this.apiUrl}/api/user/check`)
                    .then(() => {
                        this.getProductsData()
                    }).catch(err => {
                        console.log(err)
                        alert(err.data.message)
                        location.href = this.repatriationPage
                    })
            }
        }, getProductsData() {
            axios.get(`${this.apiUrl}/api/${this.apiPath}/admin/products/all`)
                .then(res => {
                    this.products = [];
                    Object.values(res.data.products).forEach(i => {
                        this.products.push(i);
                    })
                }).catch(err => {
                    console.log(err)
                    alert("讀取資料異常，請重新整理或重新登入")
                })
        }, editProduct(i) {
            if (this.productTemplate.id === undefined) {
                if (this.productTemplate.category === "" || this.productTemplate.unit === "" || this.productTemplate.title === "") {
                    alert("標題.分類.單位，相關欄位不可空白")
                } else {
                    axios.post(`${this.apiUrl}/api/${this.apiPath}/admin/product`, { data: this.productTemplate })
                        .then(res => {
                            alert("新增成功")
                            this.getProductsData()
                        }).catch(err => {
                            console.log(err)
                            alert("新增異常，請與後台管理人員確認")
                        })
                }
            } else {
                this.productId = i
                delete this.productTemplate.id
                axios.put(`${this.apiUrl}/api/${this.apiPath}/admin/product/${this.productId}`, { data: this.productTemplate })
                    .then(res => {
                        alert("修改成功")
                        this.getProductsData()
                    }).catch(err => {
                        console.log(err)
                        alert("修改異常，請與後台管理人員確認")
                    })
            }
        },
        deleteProduct() {
            axios.delete(`${this.apiUrl}/api/${this.apiPath}/admin/product/${this.productId}`)
                .then(res => {
                    this.productId = "";
                    this.getProductsData();
                    alert("刪除成功");
                }).catch(err => {
                    this.productId = "";
                    if (err.status === 403) {
                        alert("無此權限，請詢問管理員或重新登入")
                    } else if (err.status === 404) {
                        alert("查無此產品ID，請與後台管理人員確認")
                    }
                })
        }
    },
    mounted() {
        this.check();
    }
}

createApp(app).mount("#app");