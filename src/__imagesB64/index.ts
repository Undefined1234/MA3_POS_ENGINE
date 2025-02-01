import {  imageBase64 as cogWheel} from "./__cogWheel"
import {  imageBase64 as LOWFRONTA} from "./__LOWFRONTA"
import {  imageBase64 as LOWFRONTI} from "./__LOWFRONTI"
import {  imageBase64 as LOWPOINTA} from "./__LOWPOINTA"
import {  imageBase64 as LOWPOINTI} from "./__LOWPOINTI"
import {  imageBase64 as LOWSPREADA} from "./__LOWSPREADA"
import {  imageBase64 as LOWSPREADI} from "./__LOWSPREADI"
import {  imageBase64 as MIDFRONTA} from "./__MIDFRONTA"
import {  imageBase64 as MIDFRONTI} from "./__MIDFRONTI"
import {  imageBase64 as MIDPOINTA} from "./__MIDPOINTA"
import {  imageBase64 as MIDPOINTI} from "./__MIDPOINTI"
import {  imageBase64 as MIDPSREADA} from "./__MIDPSREADA"
import {  imageBase64 as MIDPSREADI} from "./__MIDPSREADI"
import {  imageBase64 as UPFRONTA} from "./__UPFRONTA"
import {  imageBase64 as UPFRONTI} from "./__UPFRONTI"
import {  imageBase64 as UPPOINTA} from "./__UPPOINTA"
import {  imageBase64 as UPPOINTI} from "./__UPPOINTI"
import {  imageBase64 as UPSPREADA} from "./__UPSPREADA"
import {  imageBase64 as UPSPREADI} from "./__UPSPREADI"

export type ImageKey = "cogWheel" |
	"LOWFRONTA" |
	"LOWFRONTI" |
	"LOWPOINTA" |
	"LOWPOINTI" |
	"LOWSPREADA" |
	"LOWSPREADI" |
	"MIDFRONTA" |
	"MIDFRONTI" |
	"MIDPOINTA" |
	"MIDPOINTI" |
	"MIDPSREADA" |
	"MIDPSREADI" |
	"UPFRONTA" |
	"UPFRONTI" |
	"UPPOINTA" |
	"UPPOINTI" |
	"UPSPREADA" |
	"UPSPREADI"

export const images: {[key in ImageKey]: {fileName: string, imageBase64: string}} = {
    cogWheel: { fileName: "cogWheel.png", imageBase64: cogWheel },
	LOWFRONTA: { fileName: "LOWFRONTA.png", imageBase64: LOWFRONTA },
	LOWFRONTI: { fileName: "LOWFRONTI.png", imageBase64: LOWFRONTI },
	LOWPOINTA: { fileName: "LOWPOINTA.png", imageBase64: LOWPOINTA },
	LOWPOINTI: { fileName: "LOWPOINTI.png", imageBase64: LOWPOINTI },
	LOWSPREADA: { fileName: "LOWSPREADA.png", imageBase64: LOWSPREADA },
	LOWSPREADI: { fileName: "LOWSPREADI.png", imageBase64: LOWSPREADI },
	MIDFRONTA: { fileName: "MIDFRONTA.png", imageBase64: MIDFRONTA },
	MIDFRONTI: { fileName: "MIDFRONTI.png", imageBase64: MIDFRONTI },
	MIDPOINTA: { fileName: "MIDPOINTA.png", imageBase64: MIDPOINTA },
	MIDPOINTI: { fileName: "MIDPOINTI.png", imageBase64: MIDPOINTI },
	MIDPSREADA: { fileName: "MIDPSREADA.png", imageBase64: MIDPSREADA },
	MIDPSREADI: { fileName: "MIDPSREADI.png", imageBase64: MIDPSREADI },
	UPFRONTA: { fileName: "UPFRONTA.png", imageBase64: UPFRONTA },
	UPFRONTI: { fileName: "UPFRONTI.png", imageBase64: UPFRONTI },
	UPPOINTA: { fileName: "UPPOINTA.png", imageBase64: UPPOINTA },
	UPPOINTI: { fileName: "UPPOINTI.png", imageBase64: UPPOINTI },
	UPSPREADA: { fileName: "UPSPREADA.png", imageBase64: UPSPREADA },
	UPSPREADI: { fileName: "UPSPREADI.png", imageBase64: UPSPREADI }
}