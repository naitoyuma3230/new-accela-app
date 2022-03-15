// HTML要素の取得
const sensor_contents = document.getElementById("sensor_contents");
const sensor_start = document.getElementById("sensor_start");
const sensor_stop = document.getElementById("sensor_stop");
const output = document.getElementById("output");
const time = document.getElementById("time");

const result_x = document.getElementById("result_x");
const result_y = document.getElementById("result_y");
const result_z = document.getElementById("result_z");

const result_al = document.getElementById("result_al");
const result_be = document.getElementById("result_be");
const result_ga = document.getElementById("result_ga");

let startInterval;

// 加速度センサー値
let x = 0;
let y = 0;
let z = 0;

// 重力加速度を除いた加速度値
// let gx = 0;
// let gy = 0;
// let gz = 0;

// ジャイロセンサー値
let alpha = 0;
let beta = 0;
let gamma = 0;

let firstdate;
let firsttime;
let datalist = [];

// グラフ描画用データ値
let timeArray = [];
let xArray = [];
let yArray = [];
let zArray = [];

// アクセス許可を求めデバイスモーションセンサーを起動
const requestDeviceMotionPermission = function () {
	sensor_contents.setAttribute("disabled", true);
	// デバイスにセンサー機能が実装されているか判定
	if (
		DeviceMotionEvent &&
		typeof DeviceMotionEvent.requestPermission === "function"
	) {
		// iOS 13以降はユーザーのアクセス許可が必要
		// ボタンクリックで許可を取得
		DeviceMotionEvent.requestPermission()
			.then((permissionState) => {
				output.textContent = "Success";
				if (permissionState === "granted") {
					// devicemotionをイベントリスナーに追加
					// 加速度センサーの起動
					window.addEventListener(
						"devicemotion",
						function (event) {
							// 重力加速度値の取得
							x = event.accelerationIncludingGravity.x;
							y = event.accelerationIncludingGravity.y;
							z = event.accelerationIncludingGravity.z;

							// // // 重力加速度を除いた加速度値
							// gx = event.acceleration.x;
							// gy = event.acceleration.y;
							// gz = event.acceleration.z;

							result_x.textContent = "X：" + x.toFixed(2);
							result_y.textContent = "Y：" + y.toFixed(2);
							result_z.textContent = "Z：" + z.toFixed(2);
						},
						false
					);

					// deviceorientationをイベントリスナーの追加
					// ジャイロセンサーを起動
					window.addEventListener(
						"deviceorientation",
						function (event) {
							// ジャイロセンサー値取得
							alpha = event.alpha;
							beta = event.beta;
							gamma = event.gamma;

							// result2.innerHTML = "ジャイロセンサー<br />" +
							// "alpha：" + alpha.toFixed(2) +"°<br />" +
							// "beta ：" + beta.toFixed(2)  +"°<br />" +
							// "gamma：" + gamma.toFixed(2) +"°<br />";

							result_al.innerHTML = "alpha：" + alpha.toFixed(2);
							result_be.innerHTML = "beta ：" + beta.toFixed(2);
							result_ga.innerHTML = "gamma：" + gamma.toFixed(2);
						},
						false
					);
				} else {
					// センサーアクセス許可が得られなかった場合
					output.textContent = "Not Accept";
				}
			})
			.catch(console.error);
	} else {
		// https通信でない場合などで許可を取得できなかった場合
		output.textContent = "デバイスが対応していません";
	}
};

//デバイスセンサーのアクセス承認を実行
sensor_contents.addEventListener("click", requestDeviceMotionPermission, false);

//計測開始
sensor_start.addEventListener("click", function () {
	// ボタンのアクティブ化の切り替え
	sensor_start.setAttribute("disabled", true);
	sensor_stop.removeAttribute("disabled");
	document.getElementById("run").removeAttribute("hidden");
	document.getElementById("stop").setAttribute("hidden", true);
	document.getElementById("download").classList.add("disabled");

	// 前回保存したセンサー値の破棄
	datalist = [];

	// 前回グラフデータの破棄
	timeArray = [];
	xArray = [];
	yArray = [];
	zArray = [];
	alphaArray = [];
	betaArray = [];
	gammaArray = [];

	// 測定開始時間の取得
	firstdate = new Date();
	firsttime = firstdate.getTime();

	// 計測データの変数保存開始
	startInterval = window.setInterval(() => {
		// 測定経過時間の取得
		let date = new Date();
		let time_unix = date.getTime() - firsttime;

		// 経過時間下一桁切り捨て0.01ms単位
		time_unix = Math.round(time_unix / 10) / 100;

		//データを配列で保持 array = [ [...], [...], ...]
		let acc_gyro = [time_unix, x, y, z, alpha, beta, gamma];
		datalist.push(acc_gyro);

		// 測定経過時間の表示
		time.textContent = "Time(sec)：" + time_unix;

		// グラフ描画用データの保持
		timeArray.push(time_unix);
		xArray.push(x);
		yArray.push(y);
		zArray.push(z);

		// drawingChart();
		//最初はnew、その後はupdate
		drawingChart();
	}, 10); //10ms（0.01秒）毎に実行
});

// 計測終了
sensor_stop.addEventListener("click", function () {
	// ボタンのアクティブ化の切り替え
	sensor_stop.setAttribute("disabled", true);
	sensor_start.removeAttribute("disabled");
	document.getElementById("download").classList.remove("disabled");
	document.getElementById("stop").removeAttribute("hidden");
	document.getElementById("run").setAttribute("hidden", true);

	// setInterval停止
	clearInterval(startInterval);
});

download.addEventListener("click", function () {
	// デバッグ用ダミー計測値
	// acc_gyro = [1,3,2,-2,5,2,1];
	// datalist.push(acc);

	// acc_gyro = [2,2,5,9,35,4,];
	// datalist.push(acc);

	// acc_gyro = [3,1,-2,2,12,6,6];
	// datalist.push(acc);

	// acc_gyro = [4,-3,-2,5,2,6,4];
	// datalist.push(acc);
	// console.log(datalist);

	// datalist = [
	//   [1, 1, 2, 3, 3, 4, 3],
	//   [2, 3, 2, 4, 8, 6, 7],
	//   [3, 5, 3, -5, 6, 7, 9]
	// ];

	// CSV用配列 csvData = [time, x, y, z, '\n', time, x, y, ...]
	let csvData = ["time(sec)", "x", "y", "z", "alpha", "beta", "gamma", "\n"];
	for (let i = 0; i < datalist.length; i++) {
		let row = Object.values(datalist[i]).join(",");
		csvData += row + "\n";
	}
	// console.log(csvData);

	// Downloadボタンでcsv出力
	let blob = new Blob([csvData], { type: "text/csv" });
	let link = document.getElementById("download");
	link.href = URL.createObjectURL(blob);
	link.download = "センサー計測値.csv";
});

let drawingChart = function () {
	// Accelerationグラフ
	if (myAccLineChart) {
		myAccLineChart.update();
	}
	var ctxAcc = document.getElementById("accChart").getContext("2d");

	var myAccLineChart = new Chart(ctxAcc, {
		type: "line",
		data: {
			labels: timeArray,
			datasets: [
				{
					data: xArray,
					label: "X",
					pointRadius: 0.8,
					pointHoverRadius: 0,
					borderWidth: 0.4,
					borderColor: "rgba(255,0,0,1)",
					backgroundColor: "rgba(0,0,0,0)",
				},
				{
					data: yArray,
					label: "Y",
					pointRadius: 0.8,
					pointHoverRadius: 0,
					borderWidth: 0.4,
					borderColor: "rgba(0,0,255,1)",
					backgroundColor: "rgba(0,0,0,0)",
				},
				{
					data: zArray,
					label: "Z",
					pointRadius: 0.8,
					pointHoverRadius: 0,
					borderWidth: 0.4,
					borderColor: "rgba(0,255,0,1)",
					backgroundColor: "rgba(0,0,0,0)",
				},
			],
		},
		options: {
			animation: {
				duration: 0,
			},
			hover: {
				animationDuration: 0,
			},
			responsiveAnimationDuration: 0,
			tooltips: {
				enabled: false,
			},
			title: {
				display: true,
				text: "Acceleration",
			},
			scales: {
				xAxes: [
					{
						gridLines: {
							display: false,
						},
						ticks: {
							display: false,
						},
					},
				],
				yAxes: [
					{
						ticks: {
							suggestedMax: 15,
							suggestedMin: -15,
							stepSize: 5,
						},
					},
				],
			},
		},
	});
};
