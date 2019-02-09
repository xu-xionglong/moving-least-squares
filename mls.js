function mls2D(controlPoints, gridWidth, gridHeight, outputMesh)
{
	let miu;
	outputMesh.length = gridWidth * gridHeight * 2;

	//与源控制点的距离求得的权重
	let weights = new Map();
	let weightsSum;

	for(let i = 0; i < gridHeight; ++ i) {
		for(let j = 0; j < gridWidth; ++ j) {
			let pointIndex = gridWidth * i + j;
			if(!controlPoints.has(pointIndex)) {
				//不属于控制点

				//求加权重心p*, q*，权重值保存起来后面还有用
				let pCentroidX = 0;
				let pCentroidY = 0;
				let qCentroidX = 0;
				let qCentroidY = 0;
				weightsSum = 0;
				for(let [controlPointIndex, controlPointDst] of controlPoints) {
					let px = controlPointIndex % gridWidth;
					let py = Math.floor(controlPointIndex / gridWidth);
					let qx = controlPointDst[0];
					let qy = controlPointDst[1];
					let weight = 1 / ((j - px) * (j - px) + (i - py) * (i - py));
					weights.set(controlPointIndex, weight);
					weightsSum += weight;
					pCentroidX += weight * px;
					pCentroidY += weight * py;
					qCentroidX += weight * qx;
					qCentroidY += weight * qy;
				}
				pCentroidX /= weightsSum;
				pCentroidY /= weightsSum;
				qCentroidX /= weightsSum;
				qCentroidY /= weightsSum;

				//计算M
				let s1 = 0;
				let s2 = 0;
				let m00 = 0;
				let m01 = 0;
				let m10 = 0;
				let m11 = 0;
				for(let [controlPointIndex, controlPointDst] of controlPoints) {
					let px = controlPointIndex % gridWidth;
					let py = Math.floor(controlPointIndex / gridWidth);
					let qx = controlPointDst[0];
					let qy = controlPointDst[1];

					let dQx = qx - qCentroidX;
					let dQy = qy - qCentroidY;
					let dPx = px - pCentroidY;
					let dPy = py - pCentroidY;
					let weight = weights.get(controlPointIndex);
					s1 += (dQx * dPx + dQy * dPy) * weight;
					s2 += (dQx * (-dPy) + dQy * dPx) * weight;

					m00 += (dPx * dQx + dPy * dQy) * weight;
					m01 += (dPx * dQy - dPy * dQx) * weight;
					m10 += (dPy * dQx - dPx * dQy) * weight;
					m11 += (dPy * dQy + dPx * dQx) * weight;
				}
				let miu = Math.sqrt(s1 * s1 + s2 * s2);
				m00 /= miu;
				m01 /= miu;
				m10 /= miu;
				m11 /= miu;

				outputMesh[pointIndex * 2] = (j - pCentroidX) * m00 + (i - pCentroidY) * m10 + qCentroidX;
				outputMesh[pointIndex * 2 + 1] = (j - pCentroidX) * m01 + (i - pCentroidY) * m11 + qCentroidY;	
			}
			else {
				outputMesh[pointIndex * 2] = controlPoints.get(pointIndex)[0];
				outputMesh[pointIndex * 2 + 1] = controlPoints.get(pointIndex)[1];
			}
		}
	}
}