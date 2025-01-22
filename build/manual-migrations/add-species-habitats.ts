import fs from "fs";
import path from "path";
import url from "url";

const data = [
  {
      "_id": "pCSOFZ2UvRx8QTGs",
      "system.habitats": [
          "forest",
          "jungle"
      ]
  },
  {
      "_id": "0aQTTovxCpldlnaG",
      "system.habitats": [
          "forest",
          "jungle"
      ]
  },
  {
      "_id": "YBXCR6S01hDO23hM",
      "system.habitats": [
          "forest",
          "jungle"
      ]
  },
  {
      "_id": "QEUZx1xKGWHNOHde",
      "system.habitats": [
          "forest",
          "jungle"
      ]
  },
  {
      "_id": "DLpRR7pFa4VCgCpC",
      "system.habitats": [
          "forest",
          "jungle"
      ]
  },
  {
      "_id": "mKuandwsKyvBQnmG",
      "system.habitats": [
          "forest",
          "jungle"
      ]
  },
  {
      "_id": "BmuDohMAWcHopUmk",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "iS3osR58JBMCkN6g",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "PhFGJrxZDAK8PxwU",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "4SfdmzV3FAUxlffS",
      "system.habitats": [
          "forest",
          "field",
          "grassland",
          "city"
      ]
  },
  {
      "_id": "PHlbmAo6Yy55QOwd",
      "system.habitats": [
          "forest",
          "field",
          "grassland"
      ]
  },
  {
      "_id": "0ITXciewxMERsUpo",
      "system.habitats": [
          "forest",
          "field",
          "grassland"
      ]
  },
  {
      "_id": "MAv2rjhIQxHSBtaS",
      "system.habitats": [
          "forest",
          "industrial"
      ]
  },
  {
      "_id": "51DQ5cBn68dooAjt",
      "system.habitats": [
          "forest",
          "field",
          "industrial",
          "beach"
      ]
  },
  {
      "_id": "dBdrPrKdHlvyC52Q",
      "system.habitats": [
          "forest",
          "field"
      ]
  },
  {
      "_id": "czJSIQDUib6snvcc",
      "system.habitats": [
          "forest",
          "field"
      ]
  },
  {
      "_id": "ezkJUBuwV2BSyMjx",
      "system.habitats": [
          "forest",
          "woodland",
          "cave"
      ]
  },
  {
      "_id": "eT9EIwRfGO44MZBA",
      "system.habitats": [
          "forest",
          "woodland",
          "cave"
      ]
  },
  {
      "_id": "MwltH6dleqKaam3F",
      "system.habitats": [
          "forest",
          "jungle",
          "woodland"
      ]
  },
  {
      "_id": "VxYZktRM42cyb377",
      "system.habitats": [
          "forest",
          "jungle",
          "woodland"
      ]
  },
  {
      "_id": "higtJ9pCDXvwXTpk",
      "system.habitats": [
          "forest",
          "field",
          "city",
          "riverside",
          "beach",
          "ice",
          "tundra"
      ]
  },
  {
      "_id": "Wwjo1nLJmk8nQPXK",
      "system.habitats": [
          "forest",
          "field",
          "city"
      ]
  },
  {
      "_id": "dbQqTC79Shvoxozi",
      "system.habitats": [
          "forest",
          "jungle",
          "mountain"
      ]
  },
  {
      "_id": "END4xUZhQ0RnzljM",
      "system.habitats": [
          "forest",
          "jungle",
          "mountain"
      ]
  },
  {
      "_id": "vNwcjY2sLrsWVTwg",
      "system.habitats": [
          "forest",
          "woodland",
          "grassland"
      ]
  },
  {
      "_id": "gA7NALkxirYB89MJ",
      "system.habitats": [
          "forest",
          "woodland",
          "grassland"
      ]
  },
  {
      "_id": "beFkBo4N6ZEVFym8",
      "system.habitats": [
          "forest",
          "grassland",
          "riverside"
      ]
  },
  {
      "_id": "ZuUL2BTrvClv8UHX",
      "system.habitats": [
          "forest",
          "city",
          "ruin"
      ]
  },
  {
      "_id": "9ykloBS0vaj045Sc",
      "system.habitats": [
          "forest",
          "city",
          "ruin"
      ]
  },
  {
      "_id": "rFyrG3L7PpbEBVEx",
      "system.habitats": [
          "forest",
          "city",
          "ruin"
      ]
  },
  {
      "_id": "WO5ZnKYBgVECOlDE",
      "system.habitats": [
          "forest",
          "jungle",
          "grassland",
          "riverside"
      ]
  },
  {
      "_id": "Iac1AYe9wivez2LO",
      "system.habitats": [
          "forest",
          "jungle",
          "grassland",
          "riverside"
      ]
  },
  {
      "_id": "c3Ux4RF5z1C0NbVs",
      "system.habitats": [
          "forest",
          "field",
          "industrial"
      ]
  },
  {
      "_id": "G7WUIrl97y7Mss9b",
      "system.habitats": [
          "forest",
          "field",
          "industrial"
      ]
  },
  {
      "_id": "qHahjcAVwtMtOMp7",
      "system.habitats": [
          "forest",
          "jungle"
      ]
  },
  {
      "_id": "R5WkIbNYLi4z0iId",
      "system.habitats": [
          "forest",
          "jungle",
          "beach"
      ]
  },
  {
      "_id": "jpnIHP0lUThOp1zT",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "inXVND6bfUdY5ksv",
      "system.habitats": [
          "forest",
          "field",
          "city"
      ]
  },
  {
      "_id": "OFISlRjckpWyfww7",
      "system.habitats": [
          "forest",
          "jungle",
          "woodland",
          "grassland",
          "mountain"
      ]
  },
  {
      "_id": "vC6CW3g3nqTJ36dv",
      "system.habitats": [
          "forest",
          "desert"
      ]
  },
  {
      "_id": "mxrt04igU2sWYV12",
      "system.habitats": [
          "forest",
          "city"
      ]
  },
  {
      "_id": "GLVg67j2hGGz2ksx",
      "system.habitats": [
          "forest",
          "city"
      ]
  },
  {
      "_id": "dT1OJHNewsT7XKpm",
      "system.habitats": [
          "forest",
          "mountain"
      ]
  },
  {
      "_id": "57XZB84AZCseRXQa",
      "system.habitats": [
          "forest",
          "woodland",
          "tundra"
      ]
  },
  {
      "_id": "ykhYMyEWQBRUF1yW",
      "system.habitats": [
          "forest",
          "woodland",
          "tundra"
      ]
  },
  {
      "_id": "U0pL1FK5xjXRdtNS",
      "system.habitats": [
          "forest",
          "jungle",
          "woodland"
      ]
  },
  {
      "_id": "sUQeF7Cm4zzp1PVZ",
      "system.habitats": [
          "forest",
          "jungle",
          "woodland"
      ]
  },
  {
      "_id": "qQqamSREK3YVGJih",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "XvY7MkYEKI6Pe4iF",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "9UsWk3D7WV2vb5vh",
      "system.habitats": [
          "forest",
          "cave"
      ]
  },
  {
      "_id": "QD6jWQSuXY6RXXwo",
      "system.habitats": [
          "forest",
          "city",
          "industrial"
      ]
  },
  {
      "_id": "dgXlKnCPn9LUj3wJ",
      "system.habitats": [
          "forest",
          "field"
      ]
  },
  {
      "_id": "Kq678cHFRM9rOwo5",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "qcqTWSecwueL3RmH",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "oFy9QKAEAHsgijtt",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "4Lc1WXb52EXe7ocF",
      "system.habitats": [
          "forest",
          "field",
          "mountain"
      ]
  },
  {
      "_id": "YYwOzIdLPLJqCj6f",
      "system.habitats": [
          "forest",
          "field",
          "mountain"
      ]
  },
  {
      "_id": "uX40QVxyHTimuNF8",
      "system.habitats": [
          "forest",
          "field",
          "mountain"
      ]
  },
  {
      "_id": "93OKTwtJ2705u1D8",
      "system.habitats": [
          "forest",
          "jungle"
      ]
  },
  {
      "_id": "LvccYwJe3FEhCo49",
      "system.habitats": [
          "forest",
          "woodland",
          "city",
          "swamp"
      ]
  },
  {
      "_id": "VKGUr7j5x3XJTm5r",
      "system.habitats": [
          "forest",
          "woodland",
          "cave",
          "pond"
      ]
  },
  {
      "_id": "nDWC0gq0pNsTrETE",
      "system.habitats": [
          "forest",
          "cave"
      ]
  },
  {
      "_id": "LlqzIZZWQKSwzjwP",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "OreUkgUHDdwDzkIy",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "bya8DmNAyr8EDKM3",
      "system.habitats": [
          "forest",
          "mountain",
          "desert",
          "badland"
      ]
  },
  {
      "_id": "STWHnq9brx7KRwB2",
      "system.habitats": [
          "forest",
          "city"
      ]
  },
  {
      "_id": "bHznFDhD3NJTMT94",
      "system.habitats": [
          "forest",
          "city"
      ]
  },
  {
      "_id": "v3CjpcALn3kCQen8",
      "system.habitats": [
          "forest",
          "woodland",
          "grassland"
      ]
  },
  {
      "_id": "4FCFUtddzH0QY7XK",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "16CvEe5rvVo3MMZB",
      "system.habitats": [
          "forest",
          "swamp",
          "tundra"
      ]
  },
  {
      "_id": "XzpDUH3qDGH7y1Dz",
      "system.habitats": [
          "forest",
          "swamp",
          "tundra"
      ]
  },
  {
      "_id": "IGqK6DItWO3vDT68",
      "system.habitats": [
          "forest",
          "mountain",
          "tundra"
      ]
  },
  {
      "_id": "XLSyfsD7DdksGJrp",
      "system.habitats": [
          "forest",
          "city"
      ]
  },
  {
      "_id": "LXFlse9HJRVgIpxq",
      "system.habitats": [
          "forest",
          "jungle"
      ]
  },
  {
      "_id": "b5yGeiH6UAMEY3A3",
      "system.habitats": [
          "forest",
          "jungle"
      ]
  },
  {
      "_id": "DIG4YH9chCDY1sUk",
      "system.habitats": [
          "forest",
          "jungle"
      ]
  },
  {
      "_id": "euz9eBG77flo6BEq",
      "system.habitats": [
          "forest",
          "grassland",
          "tundra"
      ]
  },
  {
      "_id": "OxChMbrBdMuUwlbZ",
      "system.habitats": [
          "forest",
          "grassland",
          "tundra"
      ]
  },
  {
      "_id": "Shyo7CPSOYXGtgnR",
      "system.habitats": [
          "forest",
          "woodland",
          "field",
          "grassland",
          "city"
      ]
  },
  {
      "_id": "KsUIMHn0ZoBOwIAA",
      "system.habitats": [
          "forest",
          "woodland",
          "field",
          "grassland",
          "city"
      ]
  },
  {
      "_id": "hmph3LYhawO70pes",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "W8SR9b5EwvxtzIKk",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "g9LFPZPUUaDCJ2mt",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "jl2vWuKiTk1OgSOQ",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "unsutL4D1ZHXsU6J",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "8APwRcUrlDKArJHS",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "xEj6aYfztNCAYJtK",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "Clk5ziNnprI0ZrP8",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "uwQ2qQceyYUneOVT",
      "system.habitats": [
          "forest",
          "city"
      ]
  },
  {
      "_id": "hiW0kzcQk3Y9eLVg",
      "system.habitats": [
          "forest",
          "city"
      ]
  },
  {
      "_id": "YHAeSJtSkBZWlQas",
      "system.habitats": [
          "forest",
          "city"
      ]
  },
  {
      "_id": "JE8GPjktnR74usYK",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "DVxFDXSBLpYdF5qr",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "ZvJhKZaTOFO6TENx",
      "system.habitats": [
          "forest",
          "jungle",
          "woodland"
      ]
  },
  {
      "_id": "in4xe3cS1FT1CJbV",
      "system.habitats": [
          "forest",
          "jungle",
          "woodland"
      ]
  },
  {
      "_id": "CPqy3JMoLT35Kmv8",
      "system.habitats": [
          "forest",
          "jungle",
          "woodland"
      ]
  },
  {
      "_id": "jVzTLx54APRZZKfQ",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "SXkan0pbNjMVhUoo",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "vTQSDGpe2WHOarsH",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "xUyfshSw2JNmUJ1n",
      "system.habitats": [
          "forest",
          "city"
      ]
  },
  {
      "_id": "nkomNz1cjlbVXI9e",
      "system.habitats": [
          "forest",
          "city"
      ]
  },
  {
      "_id": "7csuvOJwop7f1qp8",
      "system.habitats": [
          "forest",
          "field",
          "pond"
      ]
  },
  {
      "_id": "GxbK0KYtuJxBy0YH",
      "system.habitats": [
          "forest",
          "field",
          "pond"
      ]
  },
  {
      "_id": "IRqRMuRPs6SVgbcQ",
      "system.habitats": [
          "forest",
          "field",
          "city",
          "volcano"
      ]
  },
  {
      "_id": "wPSInQ7575BXezZe",
      "system.habitats": [
          "forest",
          "field",
          "volcano"
      ]
  },
  {
      "_id": "dM0WhMg8UD4b1x4x",
      "system.habitats": [
          "forest",
          "jungle",
          "field"
      ]
  },
  {
      "_id": "NRLM4OLKyc5fyeQ6",
      "system.habitats": [
          "forest",
          "woodland",
          "badland",
          "ruin"
      ]
  },
  {
      "_id": "AHcoRwAZ2zheJlfe",
      "system.habitats": [
          "forest",
          "woodland",
          "badland",
          "ruin"
      ]
  },
  {
      "_id": "RMlsWjTFvdJLQIAp",
      "system.habitats": [
          "forest",
          "cave"
      ]
  },
  {
      "_id": "zwk3Cxtz5OeFxYaC",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "z1rJJ40EdjqjZNhx",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "Lvf6kG8TYzBGt3mV",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "2OzfLt0n8iyy1Yx0",
      "system.habitats": [
          "forest",
          "field",
          "city",
          "mountain"
      ]
  },
  {
      "_id": "9ilbIhCxdkrHZAc2",
      "system.habitats": [
          "forest",
          "field",
          "mountain"
      ]
  },
  {
      "_id": "MrzgggdKizEjsZmh",
      "system.habitats": [
          "forest",
          "field",
          "mountain"
      ]
  },
  {
      "_id": "kmFRu6lAhtEfASJy",
      "system.habitats": [
          "forest",
          "city",
          "riverside"
      ]
  },
  {
      "_id": "KkZGHoV5VoKO94eE",
      "system.habitats": [
          "forest",
          "city",
          "riverside"
      ]
  },
  {
      "_id": "heMcRmrA3pK8e2kU",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "v9agBcB1ewBRiDPX",
      "system.habitats": [
          "forest",
          "cave"
      ]
  },
  {
      "_id": "DmtwbwJnTIgpwUK0",
      "system.habitats": [
          "forest",
          "cave"
      ]
  },
  {
      "_id": "zKMWGB4GSrqY5deJ",
      "system.habitats": [
          "forest",
          "field",
          "city",
          "industrial"
      ]
  },
  {
      "_id": "gvY2vyuQqc9YPg4y",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "zEz3oqCULVcENsLD",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "RJ4Y4dZbojlhWb2R",
      "system.habitats": [
          "forest",
          "jungle"
      ]
  },
  {
      "_id": "kAlV5PiG4MluFakr",
      "system.habitats": [
          "forest",
          "mountain",
          "riverside",
          "tundra"
      ]
  },
  {
      "_id": "DRz7zePfs5CZFLMt",
      "system.habitats": [
          "forest",
          "mountain",
          "riverside",
          "tundra"
      ]
  },
  {
      "_id": "cSBQdAEiI42sdky2",
      "system.habitats": [
          "forest",
          "woodland",
          "cave",
          "pond"
      ]
  },
  {
      "_id": "sZEQ7M8dyoatqbAx",
      "system.habitats": [
          "forest",
          "woodland",
          "city",
          "swamp"
      ]
  },
  {
      "_id": "KLAJ4VK4JRtSWAil",
      "system.habitats": [
          "forest",
          "city"
      ]
  },
  {
      "_id": "5bXWL1J6e7yp5gMr",
      "system.habitats": [
          "forest",
          "city"
      ]
  },
  {
      "_id": "GmsRVNi7m6GseyEn",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "XWaymtXXfygKpsPv",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "xSLD7YhXycnvxbYZ",
      "system.habitats": [
          "forest",
          "mountain"
      ]
  },
  {
      "_id": "EwWHSoOg3MZwbISa",
      "system.habitats": [
          "forest",
          "field"
      ]
  },
  {
      "_id": "p7LFCVVUDhOcja5N",
      "system.habitats": [
          "forest",
          "jungle",
          "beach"
      ]
  },
  {
      "_id": "FhZwYawFSq85h0bF",
      "system.habitats": [
          "forest",
          "city",
          "mountain"
      ]
  },
  {
      "_id": "ftMjpHjT8wuRdOeE",
      "system.habitats": [
          "forest",
          "swamp"
      ]
  },
  {
      "_id": "KfwDy91jJVskYYnA",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "wxwOJ0HLzsheYlsN",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "xS4Zmx2OG1yQu3df",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "b1CWDiJxY43uvHrp",
      "system.habitats": [
          "forest",
          "mountain",
          "desert",
          "badland"
      ]
  },
  {
      "_id": "N0qK5vxpzw3opgHT",
      "system.habitats": [
          "forest",
          "woodland",
          "badland",
          "ruin"
      ]
  },
  {
      "_id": "QvOl1owpzrBeqWog",
      "system.habitats": [
          "forest",
          "field",
          "grassland"
      ]
  },
  {
      "_id": "2BcUkTAIEPNMREwB",
      "system.habitats": [
          "forest",
          "field",
          "grassland"
      ]
  },
  {
      "_id": "3zxtNc4KXdi4BoGq",
      "system.habitats": [
          "forest",
          "field",
          "grassland"
      ]
  },
  {
      "_id": "e9nKm9uBCKpU7WBt",
      "system.habitats": [
          "forest",
          "jungle",
          "woodland"
      ]
  },
  {
      "_id": "iWkR4PKu8MUsKimo",
      "system.habitats": [
          "forest",
          "jungle",
          "woodland"
      ]
  },
  {
      "_id": "JduVMHWYt0MJDYSJ",
      "system.habitats": [
          "forest",
          "jungle",
          "volcano"
      ]
  },
  {
      "_id": "2pDxz1nIRkr1axpf",
      "system.habitats": [
          "forest",
          "jungle",
          "volcano"
      ]
  },
  {
      "_id": "snQONxbSWppgl84l",
      "system.habitats": [
          "forest",
          "jungle",
          "riverside"
      ]
  },
  {
      "_id": "yloo6we2L1Mk4rU7",
      "system.habitats": [
          "forest",
          "grassland",
          "city"
      ]
  },
  {
      "_id": "PBLBp4QudOMWtuKe",
      "system.habitats": [
          "forest",
          "grassland",
          "city"
      ]
  },
  {
      "_id": "bRJcKdM7pgYhgBEs",
      "system.habitats": [
          "forest",
          "grassland"
      ]
  },
  {
      "_id": "h2cDPTI4iohzxDAW",
      "system.habitats": [
          "forest",
          "cave"
      ]
  },
  {
      "_id": "bKWhspKcoTVum7Lb",
      "system.habitats": [
          "forest",
          "cave"
      ]
  },
  {
      "_id": "DmfiLIaR8aFEg28Z",
      "system.habitats": [
          "forest",
          "city"
      ]
  },
  {
      "_id": "g7v24VDuWAUFBwDm",
      "system.habitats": [
          "forest",
          "city",
          "mountain",
          "tundra"
      ]
  },
  {
      "_id": "HGtXGrQdZylgI9t6",
      "system.habitats": [
          "forest",
          "city",
          "mountain",
          "tundra"
      ]
  },
  {
      "_id": "ZRUIkeJACO2GV2cI",
      "system.habitats": [
          "forest",
          "city",
          "mountain",
          "tundra"
      ]
  },
  {
      "_id": "xb6n9TDFCtl2vL3c",
      "system.habitats": [
          "forest",
          "mountain"
      ]
  },
  {
      "_id": "EKeVeHZZlU0J75rQ",
      "system.habitats": [
          "forest",
          "mountain"
      ]
  },
  {
      "_id": "p2o8O7anTtdbyZJE",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "t5ELZ5gOoPVi8FJS",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "LSaMVmWYKXaY7ihH",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "dNt6z45d0K3reNSu",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "SlHjp3QF6Z4Mgau4",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "wwExCkoJXLvdO33x",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "q1oiYY3LPWtx0AyY",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "UtQfaAPOJ2d3212A",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "ztjgQKgB9YCStlVs",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "6NotUlR2wosVkA2O",
      "system.habitats": [
          "forest",
          "woodland",
          "mountain",
          "tundra"
      ]
  },
  {
      "_id": "72fhTRes0vYnSafJ",
      "system.habitats": [
          "forest",
          "woodland",
          "city",
          "tundra",
          "ruin"
      ]
  },
  {
      "_id": "8BZ0uPg1HcYOAjTh",
      "system.habitats": [
          "forest",
          "woodland",
          "city",
          "tundra",
          "ruin"
      ]
  },
  {
      "_id": "rDlchjo3XmK0cmNw",
      "system.habitats": [
          "forest",
          "woodland",
          "mountain"
      ]
  },
  {
      "_id": "VF6SduFMgc1sPRc4",
      "system.habitats": [
          "forest",
          "woodland",
          "mountain"
      ]
  },
  {
      "_id": "k6S22i58HeSODtct",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "cjWY5mSlYXi33dt4",
      "system.habitats": [
          "forest",
          "field",
          "swamp"
      ]
  },
  {
      "_id": "sH4DDYOwcSUjpmBu",
      "system.habitats": [
          "forest",
          "field"
      ]
  },
  {
      "_id": "P4KrsPmXji7b7SdL",
      "system.habitats": [
          "forest",
          "field"
      ]
  },
  {
      "_id": "k9KsztuZFefZmfkH",
      "system.habitats": [
          "forest",
          "city",
          "industrial",
          "cave"
      ]
  },
  {
      "_id": "YgDAio3eQOtmFTbK",
      "system.habitats": [
          "forest",
          "cave"
      ]
  },
  {
      "_id": "wFhuc9uoClTaQ0Nh",
      "system.habitats": [
          "forest",
          "field",
          "grassland"
      ]
  },
  {
      "_id": "thRFtjkPnaiYwl35",
      "system.habitats": [
          "forest",
          "field",
          "grassland"
      ]
  },
  {
      "_id": "f6jpUrrw7tMsxgeC",
      "system.habitats": [
          "forest",
          "field",
          "grassland"
      ]
  },
  {
      "_id": "Tdxc0rMERleIVQZ5",
      "system.habitats": [
          "forest",
          "grassland",
          "desert"
      ]
  },
  {
      "_id": "kMzt0MOgVKDTz7Rt",
      "system.habitats": [
          "forest",
          "grassland",
          "desert"
      ]
  },
  {
      "_id": "ddcdH1mJmV6vJhFg",
      "system.habitats": [
          "forest",
          "grassland",
          "desert"
      ]
  },
  {
      "_id": "LDtCZ8vHNvEdcI87",
      "system.habitats": [
          "forest",
          "field",
          "mountain"
      ]
  },
  {
      "_id": "SORF118CT8ay3ECj",
      "system.habitats": [
          "forest",
          "field",
          "mountain"
      ]
  },
  {
      "_id": "mVmws75rSZEER476",
      "system.habitats": [
          "forest",
          "jungle",
          "tundra"
      ]
  },
  {
      "_id": "VDFxjQmgnAOePfhC",
      "system.habitats": [
          "forest",
          "jungle",
          "tundra"
      ]
  },
  {
      "_id": "9QBq4iWUVzFy8Ovf",
      "system.habitats": [
          "forest",
          "jungle",
          "tundra"
      ]
  },
  {
      "_id": "BEuAzmzJapPyQGlj",
      "system.habitats": [
          "forest",
          "mountain"
      ]
  },
  {
      "_id": "Y7Sst7rTBq975eA3",
      "system.habitats": [
          "forest",
          "mountain"
      ]
  },
  {
      "_id": "XDDv2UwNEcW9p29H",
      "system.habitats": [
          "forest",
          "field"
      ]
  },
  {
      "_id": "oiELlgB5jO6BEII4",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "oAcfAyKGj1nfAJFb",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "xlGMjasQB0EWJRIN",
      "system.habitats": [
          "forest",
          "cave"
      ]
  },
  {
      "_id": "VuOrNyqc20tVorTd",
      "system.habitats": [
          "forest",
          "cave"
      ]
  },
  {
      "_id": "KnyMzeo9QfPwYvKf",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "q7QqaB0YtdSC7hlw",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "1aTVRGBNljeysi9G",
      "system.habitats": [
          "forest",
          "woodland",
          "grassland"
      ]
  },
  {
      "_id": "ZIHxDT5aaCXotA6l",
      "system.habitats": [
          "forest",
          "grassland",
          "cave"
      ]
  },
  {
      "_id": "GDo4ALPAmzlzOxBj",
      "system.habitats": [
          "forest",
          "grassland"
      ]
  },
  {
      "_id": "kobN2qTt2grUHdC9",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "cwWf6xr1JjotXsKU",
      "system.habitats": [
          "forest",
          "mountain",
          "desert",
          "badland"
      ]
  },
  {
      "_id": "C4PzeKneRp32FXHy",
      "system.habitats": [
          "forest",
          "mountain",
          "desert",
          "badland"
      ]
  },
  {
      "_id": "jd96Cj8kz7MqVYia",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "oS0zGzXygYsdU8yW",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "B9vi76K96XXDDrzF",
      "system.habitats": [
          "forest",
          "city"
      ]
  },
  {
      "_id": "OeIcI6sp7gzaVm3T",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "w2qDiNUSJJdf9vD9",
      "system.habitats": [
          "forest",
          "jungle"
      ]
  },
  {
      "_id": "LmFv5BRyfuRvMCsN",
      "system.habitats": [
          "forest",
          "mountain"
      ]
  },
  {
      "_id": "GS63K4RZPOvwHCtC",
      "system.habitats": [
          "forest",
          "field",
          "industrial"
      ]
  },
  {
      "_id": "FUMCPegsEpcJucuD",
      "system.habitats": [
          "forest",
          "woodland",
          "tundra"
      ]
  },
  {
      "_id": "SDcK9D0P42Cs2qmt",
      "system.habitats": [
          "forest",
          "woodland",
          "tundra"
      ]
  },
  {
      "_id": "P5TjmXGB9w5dzcVb",
      "system.habitats": [
          "forest",
          "woodland",
          "badland",
          "swamp"
      ]
  },
  {
      "_id": "sZs1m65t7GnCoYC6",
      "system.habitats": [
          "forest",
          "woodland",
          "badland",
          "swamp"
      ]
  },
  {
      "_id": "GvnZOIhcgUghJorU",
      "system.habitats": [
          "forest",
          "woodland",
          "city",
          "badland",
          "swamp"
      ]
  },
  {
      "_id": "IxJK8LngMTfnx5tr",
      "system.habitats": [
          "forest",
          "field"
      ]
  },
  {
      "_id": "WSZTE98PV6xfzetj",
      "system.habitats": [
          "forest",
          "field"
      ]
  },
  {
      "_id": "TdsKTouFnIQyH4yD",
      "system.habitats": [
          "forest",
          "field"
      ]
  },
  {
      "_id": "g1e16dsAQ1Jhp5dP",
      "system.habitats": [
          "forest",
          "woodland",
          "field"
      ]
  },
  {
      "_id": "CBSbMMFL2z9YHUUh",
      "system.habitats": [
          "forest",
          "woodland",
          "field"
      ]
  },
  {
      "_id": "UzTe4h4Vy1oEf7ro",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "xnJet59AouDBHvBo",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "vN7yFgFuxp5X5K7O",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "3xBUsvMFpLPG7DYW",
      "system.habitats": [
          "forest",
          "grassland",
          "riverside"
      ]
  },
  {
      "_id": "2Uayp6CNOzMqbBjG",
      "system.habitats": [
          "forest",
          "city"
      ]
  },
  {
      "_id": "sjB6t0RhdoluKXYH",
      "system.habitats": [
          "forest",
          "field",
          "grassland"
      ]
  },
  {
      "_id": "wAe3hlVa6hpXowqV",
      "system.habitats": [
          "forest",
          "woodland",
          "mountain",
          "badland"
      ]
  },
  {
      "_id": "qDf2FRwuhuyljRRI",
      "system.habitats": [
          "forest",
          "woodland",
          "field"
      ]
  },
  {
      "_id": "QZMTn9Ysn9SIFW7Q",
      "system.habitats": [
          "forest",
          "woodland",
          "field"
      ]
  },
  {
      "_id": "xTFKwbxvYLluaEaw",
      "system.habitats": [
          "forest",
          "woodland",
          "field"
      ]
  },
  {
      "_id": "1lXuaeZZ03MM1TT7",
      "system.habitats": [
          "forest",
          "jungle",
          "woodland"
      ]
  },
  {
      "_id": "PpXrPYxSqbKxqB3V",
      "system.habitats": [
          "forest",
          "jungle",
          "woodland"
      ]
  },
  {
      "_id": "Or9syi5XxX95xUna",
      "system.habitats": [
          "forest",
          "field",
          "industrial",
          "mountain"
      ]
  },
  {
      "_id": "baEjXC9g3nQSs6EO",
      "system.habitats": [
          "forest",
          "field",
          "industrial",
          "mountain"
      ]
  },
  {
      "_id": "0XaTNZQyos2SNwZl",
      "system.habitats": [
          "forest",
          "field",
          "industrial",
          "mountain"
      ]
  },
  {
      "_id": "uv71Hy3rpMJnb6TR",
      "system.habitats": [
          "forest",
          "field",
          "city"
      ]
  },
  {
      "_id": "QjE33irmIwRWn2Pk",
      "system.habitats": [
          "forest",
          "field",
          "city"
      ]
  },
  {
      "_id": "nbZGqpeLBED6YOu7",
      "system.habitats": [
          "forest",
          "city"
      ]
  },
  {
      "_id": "TAJuJagFQJSy8A7k",
      "system.habitats": [
          "forest",
          "city"
      ]
  },
  {
      "_id": "yhBST6knf1tDOyrq",
      "system.habitats": [
          "forest",
          "jungle",
          "woodland"
      ]
  },
  {
      "_id": "FgjJwInkQowGNvJX",
      "system.habitats": [
          "forest",
          "jungle",
          "woodland"
      ]
  },
  {
      "_id": "kRIjctuBunaR3Eo4",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "OBUjLWuKxzkiCplo",
      "system.habitats": [
          "forest",
          "woodland"
      ]
  },
  {
      "_id": "qClR8DEJOTcbdwFm",
      "system.habitats": [
          "forest",
          "mountain",
          "tundra",
          "ruin"
      ]
  },
  {
      "_id": "bWmeTixM3M19meOu",
      "system.habitats": [
          "forest",
          "mountain",
          "tundra",
          "ruin"
      ]
  },
  {
      "_id": "fY8c3nFjN0Fvge4c",
      "system.habitats": [
          "forest",
          "jungle",
          "mountain"
      ]
  },
  {
      "_id": "Rfy05K8o7QQIte5g",
      "system.habitats": [
          "forest",
          "city"
      ]
  },
  {
      "_id": "Act66k3ubXPSSUyG",
      "system.habitats": [
          "forest"
      ]
  },
  {
      "_id": "ENShFJtjtKJ0yiDU",
      "system.habitats": [
          "jungle",
          "grassland"
      ]
  },
  {
      "_id": "kOLod1LukmD0rxiT",
      "system.habitats": [
          "jungle",
          "grassland"
      ]
  },
  {
      "_id": "DQBhz8q6dUKQ2Sgd",
      "system.habitats": [
          "jungle",
          "grassland",
          "swamp"
      ]
  },
  {
      "_id": "IF2vM7tAGLi3TkPP",
      "system.habitats": [
          "jungle",
          "grassland",
          "swamp"
      ]
  },
  {
      "_id": "XGTHkCideLlZbbsN",
      "system.habitats": [
          "jungle",
          "grassland",
          "swamp"
      ]
  },
  {
      "_id": "eq2PxtM6khXJASV4",
      "system.habitats": [
          "jungle",
          "swamp"
      ]
  },
  {
      "_id": "dnf0EMnXKRBnbYyJ",
      "system.habitats": [
          "jungle",
          "swamp"
      ]
  },
  {
      "_id": "18tH9pj1w597iToh",
      "system.habitats": [
          "jungle",
          "swamp"
      ]
  },
  {
      "_id": "PqMo8dAwuPml7Zz7",
      "system.habitats": [
          "jungle",
          "grassland",
          "swamp"
      ]
  },
  {
      "_id": "PWvwyVK7L57aaNcO",
      "system.habitats": [
          "jungle",
          "badland"
      ]
  },
  {
      "_id": "ll7dIgaY8hDq07VX",
      "system.habitats": [
          "jungle",
          "desert",
          "ruin"
      ]
  },
  {
      "_id": "fvBxUnWfQkcRZVtX",
      "system.habitats": [
          "jungle",
          "desert",
          "ruin"
      ]
  },
  {
      "_id": "apCng95FyOXXAuu7",
      "system.habitats": [
          "jungle",
          "grassland"
      ]
  },
  {
      "_id": "08sfNy5UzDsuFiLu",
      "system.habitats": [
          "jungle"
      ]
  },
  {
      "_id": "uvoFhMykVfzCo9o8",
      "system.habitats": [
          "jungle",
          "swamp"
      ]
  },
  {
      "_id": "AJx9hzMNQGET2fDb",
      "system.habitats": [
          "jungle",
          "swamp"
      ]
  },
  {
      "_id": "j0soYophB9nL2Lbt",
      "system.habitats": [
          "jungle",
          "grassland"
      ]
  },
  {
      "_id": "bQGtsu1cXJdzRTfN",
      "system.habitats": [
          "jungle",
          "grassland",
          "city"
      ]
  },
  {
      "_id": "bN1o0wxZnCYBoIIL",
      "system.habitats": [
          "jungle",
          "grassland"
      ]
  },
  {
      "_id": "lAxEcAkBXQ3TQsqP",
      "system.habitats": [
          "jungle",
          "cave",
          "mountain"
      ]
  },
  {
      "_id": "86QjFeYYviJILdOC",
      "system.habitats": [
          "jungle",
          "cave",
          "mountain"
      ]
  },
  {
      "_id": "hlLnvIKZJ2DVgfn6",
      "system.habitats": [
          "jungle",
          "grassland"
      ]
  },
  {
      "_id": "w6TFtsx5eULodSLt",
      "system.habitats": [
          "jungle",
          "grassland"
      ]
  },
  {
      "_id": "fU6D6xRQzJIhFxHr",
      "system.habitats": [
          "jungle",
          "grassland"
      ]
  },
  {
      "_id": "o4alct1T8gxGBSyX",
      "system.habitats": [
          "jungle"
      ]
  },
  {
      "_id": "u6Md4wvfELtKoukv",
      "system.habitats": [
          "jungle"
      ]
  },
  {
      "_id": "ftKVfGQQoFvAs6AT",
      "system.habitats": [
          "jungle"
      ]
  },
  {
      "_id": "cgbvA2TuStaiyLNL",
      "system.habitats": [
          "jungle",
          "woodland",
          "industrial"
      ]
  },
  {
      "_id": "qpAgx3txkwrZAcpb",
      "system.habitats": [
          "jungle",
          "woodland",
          "industrial"
      ]
  },
  {
      "_id": "K9gS2PXkyr9m7sL2",
      "system.habitats": [
          "jungle",
          "woodland",
          "industrial"
      ]
  },
  {
      "_id": "3mVPc10vgMYlBdLf",
      "system.habitats": [
          "jungle"
      ]
  },
  {
      "_id": "XJNzlymg4yBjHIae",
      "system.habitats": [
          "jungle"
      ]
  },
  {
      "_id": "0dbMwhX9M83zoY8U",
      "system.habitats": [
          "jungle"
      ]
  },
  {
      "_id": "zc2cWbW2pqlOPHFh",
      "system.habitats": [
          "jungle"
      ]
  },
  {
      "_id": "FbpKFSy1HkCqmpSt",
      "system.habitats": [
          "jungle"
      ]
  },
  {
      "_id": "kH8Omiy9QI951JXd",
      "system.habitats": [
          "jungle",
          "mountain"
      ]
  },
  {
      "_id": "ShI7OIMp7re3pKJn",
      "system.habitats": [
          "jungle"
      ]
  },
  {
      "_id": "vTU2YkCeGBYt9u13",
      "system.habitats": [
          "jungle"
      ]
  },
  {
      "_id": "Qf1rXSZOy9dEPp5G",
      "system.habitats": [
          "jungle"
      ]
  },
  {
      "_id": "PMBo8fpPg7jUFpgy",
      "system.habitats": [
          "jungle",
          "grassland",
          "cave",
          "badland",
          "riverside"
      ]
  },
  {
      "_id": "n2W7jTlhfZD4s7Ce",
      "system.habitats": [
          "jungle",
          "grassland",
          "badland",
          "riverside"
      ]
  },
  {
      "_id": "Z0YlWu6Bcb2GFT2w",
      "system.habitats": [
          "jungle",
          "city"
      ]
  },
  {
      "_id": "bhgvYR3D8Se77vZK",
      "system.habitats": [
          "woodland",
          "grassland",
          "volcano",
          "ruin"
      ]
  },
  {
      "_id": "tF5FkNfjBftvCA68",
      "system.habitats": [
          "woodland",
          "field",
          "grassland",
          "tundra"
      ]
  },
  {
      "_id": "pSklg38HoAUHmo9Y",
      "system.habitats": [
          "woodland",
          "field",
          "grassland",
          "tundra"
      ]
  },
  {
      "_id": "D27BV3qRBFkaeJL9",
      "system.habitats": [
          "woodland",
          "swamp"
      ]
  },
  {
      "_id": "yMPdk3fZMYcERLbS",
      "system.habitats": [
          "woodland",
          "volcano",
          "badland"
      ]
  },
  {
      "_id": "endPT5oqGlyAy1L9",
      "system.habitats": [
          "woodland",
          "volcano",
          "badland"
      ]
  },
  {
      "_id": "6THltAMaj0ldckUs",
      "system.habitats": [
          "woodland",
          "grassland",
          "mountain",
          "ruin"
      ]
  },
  {
      "_id": "y5lxdl8nq0TmWq9Y",
      "system.habitats": [
          "woodland",
          "grassland",
          "mountain",
          "ruin"
      ]
  },
  {
      "_id": "bPon5Y4QhGjQbxnN",
      "system.habitats": [
          "woodland",
          "swamp"
      ]
  },
  {
      "_id": "A55DadJok9JCoX0p",
      "system.habitats": [
          "woodland",
          "mountain",
          "riverside",
          "tundra"
      ]
  },
  {
      "_id": "x7gfbFHfqE7Q1FRy",
      "system.habitats": [
          "woodland",
          "mountain",
          "riverside",
          "tundra"
      ]
  },
  {
      "_id": "1PCr2snDlIAsy4VU",
      "system.habitats": [
          "woodland",
          "city",
          "ruin"
      ]
  },
  {
      "_id": "Vrs5Fe0Gsqcc7IYL",
      "system.habitats": [
          "woodland",
          "city",
          "ruin"
      ]
  },
  {
      "_id": "vnfzRnCS8xNregTB",
      "system.habitats": [
          "woodland",
          "city",
          "ruin"
      ]
  },
  {
      "_id": "VTXC9JoiGnAzmsE3",
      "system.habitats": [
          "woodland",
          "field",
          "city"
      ]
  },
  {
      "_id": "9aaOPc3jo2hqqT8K",
      "system.habitats": [
          "woodland",
          "field"
      ]
  },
  {
      "_id": "r9n6oEZ1iF1x09EV",
      "system.habitats": [
          "woodland",
          "field"
      ]
  },
  {
      "_id": "kKU9IyKbIjn2ZOl4",
      "system.habitats": [
          "woodland",
          "field"
      ]
  },
  {
      "_id": "Az28PlJeld8Zmqoc",
      "system.habitats": [
          "woodland",
          "field"
      ]
  },
  {
      "_id": "N9X5OvfUJZs5fv53",
      "system.habitats": [
          "woodland",
          "field"
      ]
  },
  {
      "_id": "pxuoV77OKgYBv0sQ",
      "system.habitats": [
          "woodland",
          "field",
          "city"
      ]
  },
  {
      "_id": "AdhZNYH88O0j4T0K",
      "system.habitats": [
          "woodland",
          "field",
          "city"
      ]
  },
  {
      "_id": "2pVuK1e9OzaaUX91",
      "system.habitats": [
          "woodland",
          "city"
      ]
  },
  {
      "_id": "mbCAnP0byCqVjDfd",
      "system.habitats": [
          "woodland",
          "pond"
      ]
  },
  {
      "_id": "hEljjlwX73NAh5YX",
      "system.habitats": [
          "woodland",
          "pond"
      ]
  },
  {
      "_id": "YrmVHN98gkVrSYpB",
      "system.habitats": [
          "woodland",
          "pond"
      ]
  },
  {
      "_id": "A8WRI4Q4X1yuCrux",
      "system.habitats": [
          "woodland",
          "city"
      ]
  },
  {
      "_id": "Ver31B2ZvjMXBntg",
      "system.habitats": [
          "woodland",
          "city"
      ]
  },
  {
      "_id": "mlO0M42YBwrmoe2O",
      "system.habitats": [
          "woodland",
          "city"
      ]
  },
  {
      "_id": "E7Pm5gq6AvLN3BL8",
      "system.habitats": [
          "woodland",
          "grassland"
      ]
  },
  {
      "_id": "Bf4kdqlaJZWKYE7R",
      "system.habitats": [
          "woodland",
          "grassland"
      ]
  },
  {
      "_id": "s1cHLN4dQBQE7Y96",
      "system.habitats": [
          "field",
          "grassland",
          "city"
      ]
  },
  {
      "_id": "kpR4COvGYsHBgWGG",
      "system.habitats": [
          "field",
          "grassland",
          "city"
      ]
  },
  {
      "_id": "BrTY49S173LQ5vFJ",
      "system.habitats": [
          "field",
          "volcano",
          "ice",
          "ruin"
      ]
  },
  {
      "_id": "A5lsCki0qLseN8UJ",
      "system.habitats": [
          "field",
          "volcano",
          "ice",
          "ruin"
      ]
  },
  {
      "_id": "kathQV3S2hUodGAP",
      "system.habitats": [
          "field",
          "industrial"
      ]
  },
  {
      "_id": "K0oYKggAwByvrW9X",
      "system.habitats": [
          "field"
      ]
  },
  {
      "_id": "in0WUhvDFsePwDyu",
      "system.habitats": [
          "field"
      ]
  },
  {
      "_id": "UzZ4RXHwZaKD8QBp",
      "system.habitats": [
          "field"
      ]
  },
  {
      "_id": "cPVr9wWAqF4kmcXw",
      "system.habitats": [
          "field"
      ]
  },
  {
      "_id": "SrVNMRejBOWNWj6q",
      "system.habitats": [
          "field"
      ]
  },
  {
      "_id": "n9XZo28FDi9hNNTd",
      "system.habitats": [
          "field",
          "industrial"
      ]
  },
  {
      "_id": "bWrd2kY80xae5vQY",
      "system.habitats": [
          "field",
          "city"
      ]
  },
  {
      "_id": "rjVvJqc1bKPWvsfh",
      "system.habitats": [
          "field",
          "grassland"
      ]
  },
  {
      "_id": "7RAz1T2pSVTVLqIt",
      "system.habitats": [
          "field",
          "grassland"
      ]
  },
  {
      "_id": "e2J4wosPsaI6gwYM",
      "system.habitats": [
          "field",
          "mountain"
      ]
  },
  {
      "_id": "V89EpNndKm64ZShQ",
      "system.habitats": [
          "field",
          "mountain"
      ]
  },
  {
      "_id": "ipe79dnNJGK3Dh07",
      "system.habitats": [
          "field",
          "city",
          "industrial"
      ]
  },
  {
      "_id": "yf4JmEgsDIGrxG0q",
      "system.habitats": [
          "field",
          "city",
          "industrial"
      ]
  },
  {
      "_id": "VoBt5EWOY1vbTH8Z",
      "system.habitats": [
          "field"
      ]
  },
  {
      "_id": "DN39HBQfR7lFM73H",
      "system.habitats": [
          "field",
          "mountain"
      ]
  },
  {
      "_id": "iLIXYctOcL0WSTyP",
      "system.habitats": [
          "field"
      ]
  },
  {
      "_id": "qOEkEPjWF9bsKUJ1",
      "system.habitats": [
          "field"
      ]
  },
  {
      "_id": "ZJxf3yLeJGCnZHV1",
      "system.habitats": [
          "field",
          "grassland"
      ]
  },
  {
      "_id": "pu0BKQWCZzzjds4i",
      "system.habitats": [
          "field",
          "grassland"
      ]
  },
  {
      "_id": "BLAfLuxLN70u5SLB",
      "system.habitats": [
          "field",
          "grassland"
      ]
  },
  {
      "_id": "u0tWJ21vXRWiVZtH",
      "system.habitats": [
          "field"
      ]
  },
  {
      "_id": "tUAo0jg7dNMExftf",
      "system.habitats": [
          "field"
      ]
  },
  {
      "_id": "LhpXKz4usNNQmJMS",
      "system.habitats": [
          "field",
          "industrial"
      ]
  },
  {
      "_id": "IwBhk4A2sFc7ljQh",
      "system.habitats": [
          "field",
          "grassland"
      ]
  },
  {
      "_id": "9WRh376M23jW1Kbm",
      "system.habitats": [
          "field",
          "grassland"
      ]
  },
  {
      "_id": "fhEnznD8phdXhQW8",
      "system.habitats": [
          "field",
          "grassland"
      ]
  },
  {
      "_id": "yDpazyRiGv8c6Nq9",
      "system.habitats": [
          "field",
          "grassland"
      ]
  },
  {
      "_id": "wkk21YfKmkhCTzxN",
      "system.habitats": [
          "field",
          "grassland"
      ]
  },
  {
      "_id": "jq4odaKTwznsgQCb",
      "system.habitats": [
          "field",
          "city"
      ]
  },
  {
      "_id": "nPWkAtTzizAoiYHN",
      "system.habitats": [
          "field",
          "city"
      ]
  },
  {
      "_id": "tLoS6xc644PqWL1j",
      "system.habitats": [
          "field",
          "mountain"
      ]
  },
  {
      "_id": "YH7fKQKRSSKwjv9v",
      "system.habitats": [
          "field",
          "swamp"
      ]
  },
  {
      "_id": "PTV1s7FKKpVKpGHS",
      "system.habitats": [
          "field",
          "grassland"
      ]
  },
  {
      "_id": "jih1nAsvSPEpQNQs",
      "system.habitats": [
          "field",
          "grassland"
      ]
  },
  {
      "_id": "IupvLm79g6XkAap8",
      "system.habitats": [
          "field"
      ]
  },
  {
      "_id": "aqOo8ZU8b6gxXgFQ",
      "system.habitats": [
          "field"
      ]
  },
  {
      "_id": "jgw7l6Uz8PkQGMVR",
      "system.habitats": [
          "field",
          "mountain"
      ]
  },
  {
      "_id": "WHNYNe1tVkfZLgOy",
      "system.habitats": [
          "field",
          "mountain"
      ]
  },
  {
      "_id": "tu8J1WqbT8OehvmJ",
      "system.habitats": [
          "field",
          "city"
      ]
  },
  {
      "_id": "FQxi5pORMxCXGoK3",
      "system.habitats": [
          "field",
          "city"
      ]
  },
  {
      "_id": "oNVqoYmfTqDfHNRQ",
      "system.habitats": [
          "field",
          "city",
          "industrial"
      ]
  },
  {
      "_id": "ReUlmCDpQ5yNzt4W",
      "system.habitats": [
          "field",
          "city"
      ]
  },
  {
      "_id": "wmsEqbSQwM8Zay1g",
      "system.habitats": [
          "field",
          "city"
      ]
  },
  {
      "_id": "4aVT1snJD6JuZfOJ",
      "system.habitats": [
          "field"
      ]
  },
  {
      "_id": "KrA4xNn5VpfNljkI",
      "system.habitats": [
          "field",
          "city"
      ]
  },
  {
      "_id": "YzGCg9GrjCsGEOhe",
      "system.habitats": [
          "field"
      ]
  },
  {
      "_id": "9fi8Nb151ozgTzL8",
      "system.habitats": [
          "field",
          "city"
      ]
  },
  {
      "_id": "szMFqImsxO7oYpeQ",
      "system.habitats": [
          "field",
          "mountain",
          "desert",
          "ice"
      ]
  },
  {
      "_id": "HoxFjr4Ckfz51VeH",
      "system.habitats": [
          "field"
      ]
  },
  {
      "_id": "o5DJOlPZr2nzKpMe",
      "system.habitats": [
          "field"
      ]
  },
  {
      "_id": "xMABltSPihKdvSGh",
      "system.habitats": [
          "field",
          "grassland"
      ]
  },
  {
      "_id": "kgKsQHUxbINMgY0X",
      "system.habitats": [
          "field",
          "grassland"
      ]
  },
  {
      "_id": "NlIp9iPQwSvaxEV6",
      "system.habitats": [
          "field",
          "grassland"
      ]
  },
  {
      "_id": "qlkDxeqdcqS6laEA",
      "system.habitats": [
          "field"
      ]
  },
  {
      "_id": "VOkk4PFffWrsjVNE",
      "system.habitats": [
          "field",
          "grassland"
      ]
  },
  {
      "_id": "O3Duv8YFWLAx6MhQ",
      "system.habitats": [
          "field",
          "city"
      ]
  },
  {
      "_id": "AvfxaTSs2QBqaZZh",
      "system.habitats": [
          "field",
          "city"
      ]
  },
  {
      "_id": "xwMSJmATzoz4nmB8",
      "system.habitats": [
          "field",
          "grassland",
          "mountain"
      ]
  },
  {
      "_id": "92EVzSd8MDTUrRQV",
      "system.habitats": [
          "field",
          "grassland",
          "mountain"
      ]
  },
  {
      "_id": "hrVPHZURmiXIrQrw",
      "system.habitats": [
          "field",
          "city"
      ]
  },
  {
      "_id": "s9EOAIE5pFI8b1za",
      "system.habitats": [
          "field",
          "city"
      ]
  },
  {
      "_id": "QnxnmQQqFYTxDjmV",
      "system.habitats": [
          "grassland",
          "cave",
          "desert",
          "ice"
      ]
  },
  {
      "_id": "FmqwIC7tvuff5OEP",
      "system.habitats": [
          "grassland",
          "cave",
          "desert",
          "ice"
      ]
  },
  {
      "_id": "DtGN1O4rC6PJIBLm",
      "system.habitats": [
          "grassland"
      ]
  },
  {
      "_id": "cCecVPnQlACsx6Hf",
      "system.habitats": [
          "grassland"
      ]
  },
  {
      "_id": "cVTt79izrpQPFf85",
      "system.habitats": [
          "grassland"
      ]
  },
  {
      "_id": "P0atGVioDIxZ5wOr",
      "system.habitats": [
          "grassland"
      ]
  },
  {
      "_id": "u7s8GeGBD6TPhKDD",
      "system.habitats": [
          "grassland"
      ]
  },
  {
      "_id": "KEpWIwDNaQhZxsUS",
      "system.habitats": [
          "grassland"
      ]
  },
  {
      "_id": "KOXNoMzACprI2b2N",
      "system.habitats": [
          "grassland",
          "volcano",
          "mountain"
      ]
  },
  {
      "_id": "QTmMNadOKByVZSNP",
      "system.habitats": [
          "grassland",
          "volcano",
          "mountain"
      ]
  },
  {
      "_id": "Tml1HhCmkqLCP5KI",
      "system.habitats": [
          "grassland"
      ]
  },
  {
      "_id": "GzvGnqfM0tJKLCvu",
      "system.habitats": [
          "grassland"
      ]
  },
  {
      "_id": "sMeP7oy9e1Xoo1YL",
      "system.habitats": [
          "grassland",
          "mountain",
          "badland"
      ]
  },
  {
      "_id": "7bhWOgrX8BaFk8T2",
      "system.habitats": [
          "grassland",
          "cave",
          "mountain",
          "badland"
      ]
  },
  {
      "_id": "ExtatWlKusDI7VtD",
      "system.habitats": [
          "grassland",
          "volcano",
          "riverside"
      ]
  },
  {
      "_id": "mRkJYO7Gqg8xNfPl",
      "system.habitats": [
          "grassland"
      ]
  },
  {
      "_id": "25fX06darwP3mIwe",
      "system.habitats": [
          "grassland"
      ]
  },
  {
      "_id": "4EyJgCyRbUCW2dbD",
      "system.habitats": [
          "grassland"
      ]
  },
  {
      "_id": "N4UD73FfRmYSRWLT",
      "system.habitats": [
          "grassland"
      ]
  },
  {
      "_id": "6r9PIDH1IiIKDIhz",
      "system.habitats": [
          "grassland",
          "volcano"
      ]
  },
  {
      "_id": "7ZcUbcTtaf581s5h",
      "system.habitats": [
          "grassland",
          "volcano"
      ]
  },
  {
      "_id": "NUE8Npb2ku1uaF1M",
      "system.habitats": [
          "grassland",
          "mountain",
          "riverside"
      ]
  },
  {
      "_id": "vrKiqJ2C7xBcQNZm",
      "system.habitats": [
          "grassland",
          "badland"
      ]
  },
  {
      "_id": "z68IeGloKlmw5XBI",
      "system.habitats": [
          "grassland",
          "badland"
      ]
  },
  {
      "_id": "QTn1nbNwA96S2rUH",
      "system.habitats": [
          "grassland"
      ]
  },
  {
      "_id": "GBwpyiTSt1ufJn2n",
      "system.habitats": [
          "grassland",
          "volcano"
      ]
  },
  {
      "_id": "WO2qzAggtdY1v35Z",
      "system.habitats": [
          "grassland",
          "volcano"
      ]
  },
  {
      "_id": "0Ya3R77btQIeReh2",
      "system.habitats": [
          "grassland",
          "volcano"
      ]
  },
  {
      "_id": "Q5TpohDTPQasD5wR",
      "system.habitats": [
          "grassland"
      ]
  },
  {
      "_id": "3maTHI1KHJVjHFex",
      "system.habitats": [
          "grassland"
      ]
  },
  {
      "_id": "5T6shiY8HMtcob9r",
      "system.habitats": [
          "grassland",
          "city",
          "swamp"
      ]
  },
  {
      "_id": "ImuC5ysc3VgOTN9V",
      "system.habitats": [
          "grassland",
          "city",
          "swamp"
      ]
  },
  {
      "_id": "ZCwV8GJeF9aohKBX",
      "system.habitats": [
          "grassland",
          "riverside"
      ]
  },
  {
      "_id": "FceMFcAYBZ3faSvT",
      "system.habitats": [
          "grassland",
          "riverside"
      ]
  },
  {
      "_id": "vh6LElnAS6Yep8QZ",
      "system.habitats": [
          "grassland",
          "cave",
          "mountain",
          "badland"
      ]
  },
  {
      "_id": "YmNbUVfpXoWoEOoz",
      "system.habitats": [
          "grassland"
      ]
  },
  {
      "_id": "a7V7UefZkdT2G0LC",
      "system.habitats": [
          "grassland"
      ]
  },
  {
      "_id": "sFDvVKE72vFDbY5g",
      "system.habitats": [
          "grassland"
      ]
  },
  {
      "_id": "nblqEGUBR9j0toUz",
      "system.habitats": [
          "grassland",
          "badland"
      ]
  },
  {
      "_id": "26EjJQF3dPu7oRmS",
      "system.habitats": [
          "grassland",
          "badland"
      ]
  },
  {
      "_id": "U5POjFyl03EQU2F1",
      "system.habitats": [
          "grassland",
          "mountain",
          "swamp"
      ]
  },
  {
      "_id": "Kb9DgI8HEfoRLpZ7",
      "system.habitats": [
          "grassland",
          "mountain",
          "swamp"
      ]
  },
  {
      "_id": "jjhmtkzmGapwefFk",
      "system.habitats": [
          "grassland"
      ]
  },
  {
      "_id": "h1YuJHJrvt0oAeqo",
      "system.habitats": [
          "grassland"
      ]
  },
  {
      "_id": "OLjQ2WTluQkQxhEq",
      "system.habitats": [
          "grassland"
      ]
  },
  {
      "_id": "uzsf79FFnr4iFeTG",
      "system.habitats": [
          "grassland",
          "pond",
          "river",
          "riverside",
          "swamp"
      ]
  },
  {
      "_id": "0G61OYdWnLgfB6NB",
      "system.habitats": [
          "grassland",
          "badland",
          "swamp"
      ]
  },
  {
      "_id": "snM71ATVvgDT7QMq",
      "system.habitats": [
          "grassland",
          "badland",
          "swamp"
      ]
  },
  {
      "_id": "tSCjZIGVR8m7Zqhs",
      "system.habitats": [
          "grassland",
          "ruin"
      ]
  },
  {
      "_id": "GFdZuWAOXd2g9vma",
      "system.habitats": [
          "grassland"
      ]
  },
  {
      "_id": "YWuHWaRnNfqZmC46",
      "system.habitats": [
          "grassland"
      ]
  },
  {
      "_id": "Dgi5sESLA9JLPg8f",
      "system.habitats": [
          "grassland",
          "mountain"
      ]
  },
  {
      "_id": "oMUayvIW74BeRQzP",
      "system.habitats": [
          "grassland",
          "desert",
          "badland"
      ]
  },
  {
      "_id": "dWy0y4HBZI2wc87p",
      "system.habitats": [
          "grassland",
          "desert",
          "badland"
      ]
  },
  {
      "_id": "Jscbg1cDev6WOaa1",
      "system.habitats": [
          "grassland",
          "city"
      ]
  },
  {
      "_id": "VNcY48brwY2tFulA",
      "system.habitats": [
          "grassland",
          "mountain",
          "riverside"
      ]
  },
  {
      "_id": "4Ruw56UNnH6gyXpb",
      "system.habitats": [
          "city",
          "ruin"
      ]
  },
  {
      "_id": "4ChJl7kO3PXpRiap",
      "system.habitats": [
          "city",
          "ruin"
      ]
  },
  {
      "_id": "Sz9aB5gEhCc999T5",
      "system.habitats": [
          "city",
          "ruin"
      ]
  },
  {
      "_id": "uxM0hDnr6ADFQb2h",
      "system.habitats": [
          "city"
      ]
  },
  {
      "_id": "3Hkm3TOrUv2EidGL",
      "system.habitats": [
          "city"
      ]
  },
  {
      "_id": "Atgw3Pg0d2EtUZ2J",
      "system.habitats": [
          "city",
          "mountain"
      ]
  },
  {
      "_id": "uILGcg5Pu1flKNo7",
      "system.habitats": [
          "city",
          "mountain"
      ]
  },
  {
      "_id": "QB3Tz0dzVhY9mlzk",
      "system.habitats": [
          "city",
          "volcano"
      ]
  },
  {
      "_id": "4zROgjTcxyrG3HF8",
      "system.habitats": [
          "city",
          "volcano"
      ]
  },
  {
      "_id": "N6yaUbYg9QLmVMxP",
      "system.habitats": [
          "city",
          "ice"
      ]
  },
  {
      "_id": "wi4WJ5XlGJO7eMA9",
      "system.habitats": [
          "city"
      ]
  },
  {
      "_id": "XblC013bmcMJBqoR",
      "system.habitats": [
          "city"
      ]
  },
  {
      "_id": "as0m2VUV7NgVVPaA",
      "system.habitats": [
          "city"
      ]
  },
  {
      "_id": "bfUNgdPtQbCWvOm1",
      "system.habitats": [
          "city"
      ]
  },
  {
      "_id": "InWSlcoahgYkQgnA",
      "system.habitats": [
          "city",
          "mountain"
      ]
  },
  {
      "_id": "5lUVJxVPu3sJMs7N",
      "system.habitats": [
          "city",
          "mountain"
      ]
  },
  {
      "_id": "O0NBBpiwkIVuIeDi",
      "system.habitats": [
          "city"
      ]
  },
  {
      "_id": "1KtJ3jEpq0n2UqqC",
      "system.habitats": [
          "city"
      ]
  },
  {
      "_id": "zrM9iAoGID8xGZlA",
      "system.habitats": [
          "city"
      ]
  },
  {
      "_id": "QIYzkXCGv98ltEJG",
      "system.habitats": [
          "city"
      ]
  },
  {
      "_id": "uAcL7eYxt8XqH5ao",
      "system.habitats": [
          "city"
      ]
  },
  {
      "_id": "IrEX1Wq0tB8K0aWm",
      "system.habitats": [
          "city"
      ]
  },
  {
      "_id": "9vtd4WLuUltjCv7a",
      "system.habitats": [
          "city",
          "industrial"
      ]
  },
  {
      "_id": "wjibTOVO8zFO1lAL",
      "system.habitats": [
          "city",
          "ruin"
      ]
  },
  {
      "_id": "JW4F4zKbyONOfGkK",
      "system.habitats": [
          "city",
          "ruin"
      ]
  },
  {
      "_id": "NRFgLptO0ZGBQO87",
      "system.habitats": [
          "city"
      ]
  },
  {
      "_id": "U7MdsL6xXvkbyt3S",
      "system.habitats": [
          "city"
      ]
  },
  {
      "_id": "yFoAoBaj6jXtkZlC",
      "system.habitats": [
          "city"
      ]
  },
  {
      "_id": "zXdkGJ7d2GhYNbL8",
      "system.habitats": [
          "city"
      ]
  },
  {
      "_id": "o8AO2CZ5Jty8SABk",
      "system.habitats": [
          "city"
      ]
  },
  {
      "_id": "C0KAoWkaUt8FMaqO",
      "system.habitats": [
          "city"
      ]
  },
  {
      "_id": "Ywci6xoCe2eY8PJm",
      "system.habitats": [
          "city"
      ]
  },
  {
      "_id": "5bymuIwiJ9zWvBM5",
      "system.habitats": [
          "city"
      ]
  },
  {
      "_id": "TbebZS305DlE03eW",
      "system.habitats": [
          "city",
          "industrial",
          "cave"
      ]
  },
  {
      "_id": "fOGWSu1iPXZosliW",
      "system.habitats": [
          "city",
          "industrial",
          "cave"
      ]
  },
  {
      "_id": "3UMuIyKBG6VEaWyl",
      "system.habitats": [
          "city",
          "industrial",
          "cave"
      ]
  },
  {
      "_id": "zxQGl9npZd3lZFDX",
      "system.habitats": [
          "city"
      ]
  },
  {
      "_id": "NkHizVsfYJUjUlc1",
      "system.habitats": [
          "city"
      ]
  },
  {
      "_id": "DETGbLSVmqOkgjuS",
      "system.habitats": [
          "city"
      ]
  },
  {
      "_id": "R0n6lG1d5H9GZCX2",
      "system.habitats": [
          "city",
          "ruin"
      ]
  },
  {
      "_id": "gggul6ENjnXFvE37",
      "system.habitats": [
          "city",
          "ruin"
      ]
  },
  {
      "_id": "InFjiJz45Y6AyAiK",
      "system.habitats": [
          "city",
          "ice"
      ]
  },
  {
      "_id": "njbUlb0ByRCtepSb",
      "system.habitats": [
          "city",
          "industrial"
      ]
  },
  {
      "_id": "sYugbGSFVgFLXKAP",
      "system.habitats": [
          "city",
          "industrial"
      ]
  },
  {
      "_id": "x7D9WA7RFeOWVVMR",
      "system.habitats": [
          "city",
          "ruin"
      ]
  },
  {
      "_id": "ts9XjY5e4LeVjv3a",
      "system.habitats": [
          "city",
          "ruin"
      ]
  },
  {
      "_id": "Tey6pUoQBV9hYDuv",
      "system.habitats": [
          "industrial",
          "volcano",
          "cave",
          "mountain"
      ]
  },
  {
      "_id": "6HpV31ACEhyKwbrH",
      "system.habitats": [
          "industrial",
          "volcano",
          "cave",
          "mountain"
      ]
  },
  {
      "_id": "Qg9LrDff6qScwTR7",
      "system.habitats": [
          "industrial",
          "volcano",
          "cave",
          "mountain"
      ]
  },
  {
      "_id": "p3sX2wHMEBRxWt8S",
      "system.habitats": [
          "industrial"
      ]
  },
  {
      "_id": "uRZgf4wrxb4X2eLm",
      "system.habitats": [
          "industrial"
      ]
  },
  {
      "_id": "peKbrlieq04FwOaq",
      "system.habitats": [
          "industrial",
          "cave"
      ]
  },
  {
      "_id": "9EXS4qZZ1OH0aJrn",
      "system.habitats": [
          "industrial",
          "badland"
      ]
  },
  {
      "_id": "zD676fttCy7AwPLG",
      "system.habitats": [
          "industrial",
          "badland"
      ]
  },
  {
      "_id": "snjGvdgpWVBFEdFr",
      "system.habitats": [
          "industrial",
          "badland"
      ]
  },
  {
      "_id": "2ps8tAm2niP5DhXW",
      "system.habitats": [
          "industrial"
      ]
  },
  {
      "_id": "OvuheXW3kzsWBBQ5",
      "system.habitats": [
          "industrial"
      ]
  },
  {
      "_id": "GH1fNiQXI1jMzLie",
      "system.habitats": [
          "industrial",
          "pond",
          "river",
          "riverside",
          "swamp"
      ]
  },
  {
      "_id": "oaHJVMROBaHScmuc",
      "system.habitats": [
          "industrial",
          "pond",
          "river",
          "riverside",
          "swamp"
      ]
  },
  {
      "_id": "E1QakqCVmnAbx4Uo",
      "system.habitats": [
          "volcano",
          "mountain"
      ]
  },
  {
      "_id": "Q2hLhYiIuzhazIif",
      "system.habitats": [
          "volcano",
          "mountain"
      ]
  },
  {
      "_id": "9PStsTvP0J3tLcER",
      "system.habitats": [
          "volcano",
          "mountain"
      ]
  },
  {
      "_id": "UXa4k2KbIOaop5Hj",
      "system.habitats": [
          "volcano",
          "cave",
          "desert"
      ]
  },
  {
      "_id": "Yx34DYpWI4liXLGd",
      "system.habitats": [
          "volcano",
          "cave",
          "desert"
      ]
  },
  {
      "_id": "42Nx0JjL8UFTG6RH",
      "system.habitats": [
          "volcano",
          "cave",
          "mountain",
          "badland",
          "ruin"
      ]
  },
  {
      "_id": "GNqFnmJflqTwbblh",
      "system.habitats": [
          "volcano"
      ]
  },
  {
      "_id": "01mAc7dxuo3zcEb6",
      "system.habitats": [
          "volcano"
      ]
  },
  {
      "_id": "UMa2PZX2LdMnpCqu",
      "system.habitats": [
          "volcano"
      ]
  },
  {
      "_id": "vRrFjiJqWrWO9TOM",
      "system.habitats": [
          "volcano"
      ]
  },
  {
      "_id": "6mW2yEYi8WxqhdNL",
      "system.habitats": [
          "volcano"
      ]
  },
  {
      "_id": "MmFr9cyDPvz43TCQ",
      "system.habitats": [
          "volcano"
      ]
  },
  {
      "_id": "R2DHttrHgj08vTgx",
      "system.habitats": [
          "volcano"
      ]
  },
  {
      "_id": "pQC21lRJM3feUMll",
      "system.habitats": [
          "volcano",
          "mountain"
      ]
  },
  {
      "_id": "pq1D1g9vXM9SAftW",
      "system.habitats": [
          "volcano",
          "mountain"
      ]
  },
  {
      "_id": "uNHMlCgDl0icq2tk",
      "system.habitats": [
          "volcano",
          "mountain"
      ]
  },
  {
      "_id": "OK9u2rD7kH0WvWM2",
      "system.habitats": [
          "volcano",
          "mountain"
      ]
  },
  {
      "_id": "iH6sbVlGc3BeyAij",
      "system.habitats": [
          "volcano",
          "mountain"
      ]
  },
  {
      "_id": "CyUEOZ2fEns96iNe",
      "system.habitats": [
          "volcano",
          "cave",
          "badland"
      ]
  },
  {
      "_id": "gPSCeJF2lwxqG2ho",
      "system.habitats": [
          "volcano",
          "cave",
          "badland"
      ]
  },
  {
      "_id": "qmZycoT4LJnHvgYb",
      "system.habitats": [
          "volcano",
          "cave",
          "badland"
      ]
  },
  {
      "_id": "9JEs6FimVnUGxLAu",
      "system.habitats": [
          "volcano"
      ]
  },
  {
      "_id": "tzMkIJNy6WZvyoes",
      "system.habitats": [
          "volcano",
          "cave",
          "mountain"
      ]
  },
  {
      "_id": "dafxk8qcNekfOc2f",
      "system.habitats": [
          "volcano",
          "cave",
          "mountain"
      ]
  },
  {
      "_id": "hBXgr1KrkRdP4p6g",
      "system.habitats": [
          "volcano",
          "cave",
          "mountain"
      ]
  },
  {
      "_id": "g5ytyUWcwL2Sywc9",
      "system.habitats": [
          "volcano"
      ]
  },
  {
      "_id": "JndK7Uh87zSx3TLe",
      "system.habitats": [
          "volcano",
          "ruin"
      ]
  },
  {
      "_id": "KeT8ftxF69hi3GsH",
      "system.habitats": [
          "volcano",
          "badland"
      ]
  },
  {
      "_id": "4hG3nvgWaDqKRwfq",
      "system.habitats": [
          "volcano",
          "badland"
      ]
  },
  {
      "_id": "EPFsfphAF4UaHOqD",
      "system.habitats": [
          "volcano",
          "cave",
          "mountain"
      ]
  },
  {
      "_id": "4ydFX9pAs1d1ZoA2",
      "system.habitats": [
          "volcano",
          "cave",
          "mountain"
      ]
  },
  {
      "_id": "pCso8XnjVPNljuZw",
      "system.habitats": [
          "volcano",
          "cave",
          "mountain"
      ]
  },
  {
      "_id": "T03TXaXJHFdJbpGU",
      "system.habitats": [
          "volcano",
          "cave",
          "mountain"
      ]
  },
  {
      "_id": "OJ2Uf6SBZNepCj5v",
      "system.habitats": [
          "volcano",
          "mountain"
      ]
  },
  {
      "_id": "IohkYnCMdlckKUOC",
      "system.habitats": [
          "volcano",
          "mountain"
      ]
  },
  {
      "_id": "7vV5ibcY2xuz6mgT",
      "system.habitats": [
          "volcano",
          "desert"
      ]
  },
  {
      "_id": "E66dUgQy4wy6XfRl",
      "system.habitats": [
          "volcano",
          "desert"
      ]
  },
  {
      "_id": "GsJtzPqAEeFuaISg",
      "system.habitats": [
          "volcano",
          "desert"
      ]
  },
  {
      "_id": "r1xs6gQqlJMm5onZ",
      "system.habitats": [
          "volcano",
          "ruin"
      ]
  },
  {
      "_id": "eE3eVsnw34zNbLxo",
      "system.habitats": [
          "volcano",
          "ruin"
      ]
  },
  {
      "_id": "LCbaDlO5nqqFyhAZ",
      "system.habitats": [
          "volcano",
          "ruin"
      ]
  },
  {
      "_id": "M5u5Ane7NBjk3gA6",
      "system.habitats": [
          "cave"
      ]
  },
  {
      "_id": "6CibitYwEDT7XLnv",
      "system.habitats": [
          "cave"
      ]
  },
  {
      "_id": "5sXcAhedmd5rHS2y",
      "system.habitats": [
          "cave",
          "pond",
          "lake",
          "riverside",
          "swamp"
      ]
  },
  {
      "_id": "iFLjHphgXY8RxuaO",
      "system.habitats": [
          "cave",
          "mountain"
      ]
  },
  {
      "_id": "JE4QyFabtD5syQM1",
      "system.habitats": [
          "cave",
          "mountain"
      ]
  },
  {
      "_id": "oUKmJvivErBpyk4T",
      "system.habitats": [
          "cave",
          "mountain"
      ]
  },
  {
      "_id": "EkhJeHPiORiRxysb",
      "system.habitats": [
          "cave",
          "mountain"
      ]
  },
  {
      "_id": "2cvIGjbnuAQvx1Qx",
      "system.habitats": [
          "cave",
          "mountain",
          "badland"
      ]
  },
  {
      "_id": "G2wegGhHi2HzNe5a",
      "system.habitats": [
          "cave"
      ]
  },
  {
      "_id": "w309u6WHtT32xjYk",
      "system.habitats": [
          "cave",
          "mountain"
      ]
  },
  {
      "_id": "FX0I1LVP6XfIpmEQ",
      "system.habitats": [
          "cave",
          "mountain",
          "beach"
      ]
  },
  {
      "_id": "JtUA7XCG9BSrRsLb",
      "system.habitats": [
          "cave",
          "mountain",
          "badland"
      ]
  },
  {
      "_id": "1lLtQvjfQK0UcDb8",
      "system.habitats": [
          "cave",
          "mountain",
          "badland"
      ]
  },
  {
      "_id": "xkj24H8dwwLaEWga",
      "system.habitats": [
          "cave",
          "mountain",
          "badland"
      ]
  },
  {
      "_id": "wMq764I9h10Zzv0V",
      "system.habitats": [
          "cave"
      ]
  },
  {
      "_id": "fP0c9CNmocYlKmVp",
      "system.habitats": [
          "cave"
      ]
  },
  {
      "_id": "j1NARVPWfMZ8XEc2",
      "system.habitats": [
          "cave"
      ]
  },
  {
      "_id": "rq425Yun1RN04bvY",
      "system.habitats": [
          "cave"
      ]
  },
  {
      "_id": "XqS5EOUAmI7U4Qvz",
      "system.habitats": [
          "cave"
      ]
  },
  {
      "_id": "c1rDcyTKJ5oeSu5S",
      "system.habitats": [
          "cave",
          "mountain"
      ]
  },
  {
      "_id": "TL65b0poL53QZcLi",
      "system.habitats": [
          "cave",
          "mountain"
      ]
  },
  {
      "_id": "W7wfzW73LnJ24wxi",
      "system.habitats": [
          "cave",
          "mountain"
      ]
  },
  {
      "_id": "QgSwrXZb8Y8JtWuJ",
      "system.habitats": [
          "cave",
          "ruin"
      ]
  },
  {
      "_id": "U8gvcnEiHj0G3TMd",
      "system.habitats": [
          "cave",
          "ruin"
      ]
  },
  {
      "_id": "pOecoiRj4vchUUbq",
      "system.habitats": [
          "cave",
          "pond",
          "lake",
          "river",
          "swamp"
      ]
  },
  {
      "_id": "HwKuC8LF1a1FQbbp",
      "system.habitats": [
          "cave",
          "pond",
          "lake",
          "river",
          "swamp"
      ]
  },
  {
      "_id": "qSgzITy0nZJGk3DM",
      "system.habitats": [
          "cave",
          "badland"
      ]
  },
  {
      "_id": "Qq23L9zaMCA3s1OG",
      "system.habitats": [
          "cave",
          "badland"
      ]
  },
  {
      "_id": "x7aBb9o9RtA3psUs",
      "system.habitats": [
          "cave",
          "badland"
      ]
  },
  {
      "_id": "Jl4OJeqM6xAyR8U5",
      "system.habitats": [
          "cave",
          "ruin"
      ]
  },
  {
      "_id": "JmqIhSIgYIOvFO7J",
      "system.habitats": [
          "cave",
          "ruin"
      ]
  },
  {
      "_id": "HKSjENBwt7ZUdwTG",
      "system.habitats": [
          "cave"
      ]
  },
  {
      "_id": "aPaFaWoKtUg0tS0j",
      "system.habitats": [
          "cave"
      ]
  },
  {
      "_id": "XfOlaTsxp5rIzxtR",
      "system.habitats": [
          "cave",
          "desert"
      ]
  },
  {
      "_id": "NcciwHnDrpSzhUwS",
      "system.habitats": [
          "cave",
          "desert"
      ]
  },
  {
      "_id": "tKbgThnzHZV3gwYZ",
      "system.habitats": [
          "cave"
      ]
  },
  {
      "_id": "niiybV9W1nC4kszq",
      "system.habitats": [
          "cave"
      ]
  },
  {
      "_id": "OyQ6MlS6rT3mfvGD",
      "system.habitats": [
          "cave",
          "lake",
          "river",
          "riverside",
          "beach"
      ]
  },
  {
      "_id": "vltop3pwPMgTaT6v",
      "system.habitats": [
          "cave",
          "lake",
          "river",
          "riverside",
          "beach"
      ]
  },
  {
      "_id": "x9B4tiWtriPFSOgr",
      "system.habitats": [
          "cave",
          "lake",
          "river",
          "riverside",
          "beach"
      ]
  },
  {
      "_id": "OegYj6k2YaPqMRlR",
      "system.habitats": [
          "cave",
          "riverside"
      ]
  },
  {
      "_id": "cPmoJiM4zAdzbCaV",
      "system.habitats": [
          "cave",
          "riverside"
      ]
  },
  {
      "_id": "EcLZlYbShLisseIB",
      "system.habitats": [
          "cave",
          "riverside"
      ]
  },
  {
      "_id": "DmPMus0690F1jUU1",
      "system.habitats": [
          "cave",
          "riverside",
          "swamp"
      ]
  },
  {
      "_id": "RshWx0JMvuBpKszX",
      "system.habitats": [
          "cave"
      ]
  },
  {
      "_id": "BSTiiTctbDMLMgHa",
      "system.habitats": [
          "cave"
      ]
  },
  {
      "_id": "6P07cFCG4PZecwmI",
      "system.habitats": [
          "cave"
      ]
  },
  {
      "_id": "V7Wcd3NxVAcRjdQm",
      "system.habitats": [
          "cave",
          "badland"
      ]
  },
  {
      "_id": "Wq562fdLoMvrVfrG",
      "system.habitats": [
          "cave"
      ]
  },
  {
      "_id": "q9gxW9sAkcZrbYCa",
      "system.habitats": [
          "cave",
          "mountain",
          "badland"
      ]
  },
  {
      "_id": "hRdOsT7GqjzjcesL",
      "system.habitats": [
          "cave",
          "mountain",
          "badland"
      ]
  },
  {
      "_id": "qfjAigi9m2LsgFzf",
      "system.habitats": [
          "cave",
          "mountain",
          "badland"
      ]
  },
  {
      "_id": "8zwoJEr5uIUPtLr3",
      "system.habitats": [
          "cave",
          "mountain"
      ]
  },
  {
      "_id": "8QG2ActehOKL0IvR",
      "system.habitats": [
          "cave",
          "mountain",
          "badland",
          "beach"
      ]
  },
  {
      "_id": "bNvRak8vILmXFQQm",
      "system.habitats": [
          "cave",
          "mountain",
          "badland",
          "beach"
      ]
  },
  {
      "_id": "zOBc3f64f4LoyBo1",
      "system.habitats": [
          "cave",
          "mountain",
          "badland",
          "beach"
      ]
  },
  {
      "_id": "UEbqId7T1xSlTAYB",
      "system.habitats": [
          "cave",
          "desert"
      ]
  },
  {
      "_id": "KsFe5TPm9S33D25K",
      "system.habitats": [
          "cave"
      ]
  },
  {
      "_id": "4EcyYLUUncw5VfWS",
      "system.habitats": [
          "cave"
      ]
  },
  {
      "_id": "yivpZwRxkPe6SQU7",
      "system.habitats": [
          "cave"
      ]
  },
  {
      "_id": "6NKbLnXSDTXsUC0M",
      "system.habitats": [
          "cave",
          "mountain"
      ]
  },
  {
      "_id": "UDWiX64FLeZcI5Q8",
      "system.habitats": [
          "mountain"
      ]
  },
  {
      "_id": "XskHWYVrmKXXhrj6",
      "system.habitats": [
          "mountain"
      ]
  },
  {
      "_id": "Tm4pFKxxlOBlQSKc",
      "system.habitats": [
          "mountain"
      ]
  },
  {
      "_id": "AtnvFdQhkSnoY8GC",
      "system.habitats": [
          "mountain",
          "ice",
          "tundra"
      ]
  },
  {
      "_id": "Mdx7vdTa4ZyY8Hn7",
      "system.habitats": [
          "mountain",
          "badland",
          "tundra"
      ]
  },
  {
      "_id": "JvZCMEEZmlmcqXxR",
      "system.habitats": [
          "mountain"
      ]
  },
  {
      "_id": "WTTmP0uQLdXbZjfm",
      "system.habitats": [
          "mountain"
      ]
  },
  {
      "_id": "vFqQkr4Cps3Km7gw",
      "system.habitats": [
          "mountain",
          "badland"
      ]
  },
  {
      "_id": "FRMPqwOEa9bmgxEE",
      "system.habitats": [
          "mountain",
          "badland"
      ]
  },
  {
      "_id": "RjmlMnPqKge1H7hd",
      "system.habitats": [
          "mountain",
          "ruin"
      ]
  },
  {
      "_id": "xOv2NskrOVDJO1Oe",
      "system.habitats": [
          "mountain"
      ]
  },
  {
      "_id": "B2Hsd8x8bGxgB0Zt",
      "system.habitats": [
          "mountain"
      ]
  },
  {
      "_id": "9m6R9pPyomlHykNU",
      "system.habitats": [
          "mountain"
      ]
  },
  {
      "_id": "sbARHlwEqc5DKYkx",
      "system.habitats": [
          "mountain"
      ]
  },
  {
      "_id": "xz2NL68H5j8TwgGw",
      "system.habitats": [
          "mountain",
          "badland",
          "riverside"
      ]
  },
  {
      "_id": "0VW3rzumgvjBVD9c",
      "system.habitats": [
          "mountain",
          "badland",
          "riverside"
      ]
  },
  {
      "_id": "O8Xj15YdMAlEGQUL",
      "system.habitats": [
          "mountain",
          "polar",
          "ice"
      ]
  },
  {
      "_id": "chFOSHC5UcgPgwp2",
      "system.habitats": [
          "mountain"
      ]
  },
  {
      "_id": "mbEaQB9vZEquwAlB",
      "system.habitats": [
          "mountain",
          "badland",
          "ruin"
      ]
  },
  {
      "_id": "xGliALtl3MDXDbXZ",
      "system.habitats": [
          "mountain",
          "tundra"
      ]
  },
  {
      "_id": "7FQufFN5EZOn5sxs",
      "system.habitats": [
          "mountain",
          "ice",
          "tundra"
      ]
  },
  {
      "_id": "nbZYPVZGTYnXkQCz",
      "system.habitats": [
          "mountain",
          "ruin"
      ]
  },
  {
      "_id": "CgAVfHJUChE2XVGt",
      "system.habitats": [
          "mountain",
          "ruin"
      ]
  },
  {
      "_id": "kXn3djeV3pCptNiV",
      "system.habitats": [
          "mountain",
          "ruin"
      ]
  },
  {
      "_id": "df3W3MrgMPBF95Zj",
      "system.habitats": [
          "mountain",
          "riverside",
          "beach",
          "ocean"
      ]
  },
  {
      "_id": "yRbLX74Yaj4pnugd",
      "system.habitats": [
          "mountain",
          "badland",
          "riverside"
      ]
  },
  {
      "_id": "ibwRed2YdM4PSjca",
      "system.habitats": [
          "desert"
      ]
  },
  {
      "_id": "4kSLrppOKtPgNt9r",
      "system.habitats": [
          "desert"
      ]
  },
  {
      "_id": "eI4bdZQd9Sok57Uu",
      "system.habitats": [
          "desert"
      ]
  },
  {
      "_id": "x4FZcSuwHZahtxc4",
      "system.habitats": [
          "desert"
      ]
  },
  {
      "_id": "gGCBt4EckIySIvMn",
      "system.habitats": [
          "desert"
      ]
  },
  {
      "_id": "fjuZkm45B469hI81",
      "system.habitats": [
          "desert"
      ]
  },
  {
      "_id": "zLZkOnfyWMjdBrKi",
      "system.habitats": [
          "desert"
      ]
  },
  {
      "_id": "7w0E5Uf9VC07c7OG",
      "system.habitats": [
          "desert",
          "swamp"
      ]
  },
  {
      "_id": "rmOfYakdh0JC6iIE",
      "system.habitats": [
          "desert",
          "swamp"
      ]
  },
  {
      "_id": "ecTd7gCyzpbH8szK",
      "system.habitats": [
          "desert"
      ]
  },
  {
      "_id": "vwXff1BLWliu4CAt",
      "system.habitats": [
          "desert"
      ]
  },
  {
      "_id": "Pl5Zc1689xWwRe9E",
      "system.habitats": [
          "desert"
      ]
  },
  {
      "_id": "OxiRikjnbwrn4hqS",
      "system.habitats": [
          "desert",
          "ice",
          "tundra",
          "ruin"
      ]
  },
  {
      "_id": "9XVsTeifcwuQwrBZ",
      "system.habitats": [
          "desert",
          "ice",
          "tundra",
          "ruin"
      ]
  },
  {
      "_id": "5TRjdx7cqUFrGGDX",
      "system.habitats": [
          "desert"
      ]
  },
  {
      "_id": "zFEq1FVyQxfhITcN",
      "system.habitats": [
          "desert",
          "badland"
      ]
  },
  {
      "_id": "7r77AiCxiI9471yn",
      "system.habitats": [
          "desert",
          "badland"
      ]
  },
  {
      "_id": "uSaJiw1CAzTDluSy",
      "system.habitats": [
          "desert"
      ]
  },
  {
      "_id": "nLwDfj3d94ntw4au",
      "system.habitats": [
          "desert"
      ]
  },
  {
      "_id": "43IGnJ13CbMB4Zqp",
      "system.habitats": [
          "desert"
      ]
  },
  {
      "_id": "8fnQo5yUfs0CR1WC",
      "system.habitats": [
          "desert"
      ]
  },
  {
      "_id": "hLPX4EgmC73g8SFt",
      "system.habitats": [
          "desert",
          "badland"
      ]
  },
  {
      "_id": "suGLPTjK3FPhyPyG",
      "system.habitats": [
          "desert",
          "badland"
      ]
  },
  {
      "_id": "KDH54QZSvua6M2gf",
      "system.habitats": [
          "desert",
          "badland"
      ]
  },
  {
      "_id": "RayxOugZY5FoWKZA",
      "system.habitats": [
          "desert",
          "badland"
      ]
  },
  {
      "_id": "LWlRLqfhsbWg4qo6",
      "system.habitats": [
          "desert"
      ]
  },
  {
      "_id": "Oapfd0DEvlCUZwzC",
      "system.habitats": [
          "desert"
      ]
  },
  {
      "_id": "jI9m0C2OUiBGLkX6",
      "system.habitats": [
          "badland"
      ]
  },
  {
      "_id": "Gq5LQT8lWAWHhjqZ",
      "system.habitats": [
          "badland"
      ]
  },
  {
      "_id": "z48oPxYxbtuBFYYF",
      "system.habitats": [
          "badland"
      ]
  },
  {
      "_id": "hPRFW1qly3EGagCw",
      "system.habitats": [
          "badland",
          "reef",
          "polar",
          "abyss"
      ]
  },
  {
      "_id": "pyZamrkL16BWbkgG",
      "system.habitats": [
          "badland",
          "swamp",
          "tundra"
      ]
  },
  {
      "_id": "GU4tF7se5fiQ01iX",
      "system.habitats": [
          "badland",
          "swamp",
          "tundra"
      ]
  },
  {
      "_id": "uiYdrHTc7h1CP8Rj",
      "system.habitats": [
          "badland",
          "ocean",
          "reef",
          "polar",
          "abyss"
      ]
  },
  {
      "_id": "D7EFVprVAaeNuqrX",
      "system.habitats": [
          "badland",
          "lake",
          "riverside",
          "beach"
      ]
  },
  {
      "_id": "RDGFEtj1sZPtuo3y",
      "system.habitats": [
          "badland",
          "lake",
          "riverside",
          "beach"
      ]
  },
  {
      "_id": "T3n8FlfAh9bUxrKk",
      "system.habitats": [
          "badland",
          "lake",
          "riverside",
          "beach"
      ]
  },
  {
      "_id": "PzHLUMpWfyNVYnbC",
      "system.habitats": [
          "badland"
      ]
  },
  {
      "_id": "tyOFTctCMlV6AaUm",
      "system.habitats": [
          "pond",
          "lake"
      ]
  },
  {
      "_id": "bW6eeqmhQUzW3xlK",
      "system.habitats": [
          "pond",
          "lake"
      ]
  },
  {
      "_id": "ypIyub7f7VvWAXPO",
      "system.habitats": [
          "pond",
          "lake"
      ]
  },
  {
      "_id": "B8ykrIrxoItuYhG8",
      "system.habitats": [
          "pond",
          "lake",
          "river",
          "riverside"
      ]
  },
  {
      "_id": "oUfJuoj1rW1NuzjU",
      "system.habitats": [
          "pond",
          "lake",
          "riverside",
          "swamp"
      ]
  },
  {
      "_id": "GQgqAHxbXuep5oum",
      "system.habitats": [
          "pond",
          "lake",
          "riverside",
          "swamp"
      ]
  },
  {
      "_id": "WtP7Iajt5zYyQcsa",
      "system.habitats": [
          "pond",
          "lake",
          "river"
      ]
  },
  {
      "_id": "G9jBDafoftGC1sDY",
      "system.habitats": [
          "pond",
          "lake",
          "river"
      ]
  },
  {
      "_id": "MfPvVMi1p3RuREz5",
      "system.habitats": [
          "pond",
          "lake",
          "river",
          "ocean",
          "reef",
          "polar"
      ]
  },
  {
      "_id": "u1PPmnUB3ZhhGYbd",
      "system.habitats": [
          "pond",
          "lake",
          "river",
          "riverside",
          "swamp"
      ]
  },
  {
      "_id": "PpHWBVjN1fD1bRnn",
      "system.habitats": [
          "pond",
          "lake",
          "river",
          "riverside",
          "swamp"
      ]
  },
  {
      "_id": "eDeVwWD2O5YW7e8m",
      "system.habitats": [
          "pond",
          "lake",
          "riverside",
          "swamp"
      ]
  },
  {
      "_id": "sFc8dYTyU0mdNeiN",
      "system.habitats": [
          "pond",
          "lake",
          "river",
          "riverside",
          "swamp"
      ]
  },
  {
      "_id": "OlwlpCLnO2k96Jaw",
      "system.habitats": [
          "pond",
          "lake",
          "river",
          "riverside",
          "swamp"
      ]
  },
  {
      "_id": "2q5wHFHLWemwIyqy",
      "system.habitats": [
          "pond",
          "swamp"
      ]
  },
  {
      "_id": "zmRuQ2fYnY5ARsai",
      "system.habitats": [
          "pond",
          "swamp"
      ]
  },
  {
      "_id": "ZNJsweWNtFpu4Wh9",
      "system.habitats": [
          "pond",
          "swamp"
      ]
  },
  {
      "_id": "ZbiwWXho7a1IrShS",
      "system.habitats": [
          "pond",
          "lake",
          "swamp"
      ]
  },
  {
      "_id": "MGbGX5LlDp8JHQLx",
      "system.habitats": [
          "pond",
          "lake",
          "swamp"
      ]
  },
  {
      "_id": "29yYVLazOLl7g8JZ",
      "system.habitats": [
          "pond",
          "lake",
          "river",
          "riverside",
          "swamp"
      ]
  },
  {
      "_id": "wBtnZa2tuiJUo6Hi",
      "system.habitats": [
          "pond",
          "lake",
          "river"
      ]
  },
  {
      "_id": "r3kkeohIaAfIGAnn",
      "system.habitats": [
          "pond",
          "lake",
          "river"
      ]
  },
  {
      "_id": "kHGEJsEEgG6dxwrj",
      "system.habitats": [
          "pond",
          "lake",
          "river",
          "ocean",
          "reef"
      ]
  },
  {
      "_id": "MlcxWOtdwRChtxzf",
      "system.habitats": [
          "pond",
          "swamp"
      ]
  },
  {
      "_id": "8MMoK6ZUAxOmn1qW",
      "system.habitats": [
          "pond",
          "riverside",
          "swamp"
      ]
  },
  {
      "_id": "V8gLAwJnbxX27hyD",
      "system.habitats": [
          "pond",
          "riverside",
          "swamp"
      ]
  },
  {
      "_id": "mctepVs3jrdvaOp3",
      "system.habitats": [
          "pond",
          "lake",
          "river"
      ]
  },
  {
      "_id": "oTgDYWOJhv4hMnfb",
      "system.habitats": [
          "pond",
          "lake"
      ]
  },
  {
      "_id": "JMOyFyKEQve1n9q5",
      "system.habitats": [
          "pond",
          "lake"
      ]
  },
  {
      "_id": "2qA1FvQQ4S4eC3Jc",
      "system.habitats": [
          "pond",
          "swamp"
      ]
  },
  {
      "_id": "oIMyiB6yRnzlaWx4",
      "system.habitats": [
          "pond",
          "swamp"
      ]
  },
  {
      "_id": "vY8gAoHLFZ7fChvA",
      "system.habitats": [
          "pond",
          "swamp"
      ]
  },
  {
      "_id": "3ROY9ZKkp5c6RlQB",
      "system.habitats": [
          "pond",
          "river",
          "riverside"
      ]
  },
  {
      "_id": "PVD2esuzuSMSVvEu",
      "system.habitats": [
          "pond",
          "river",
          "riverside"
      ]
  },
  {
      "_id": "d2SXW3oVtcbzVoAY",
      "system.habitats": [
          "pond"
      ]
  },
  {
      "_id": "68jfEH0g9W39WJat",
      "system.habitats": [
          "pond"
      ]
  },
  {
      "_id": "GbyvZKmp7QdoBP3w",
      "system.habitats": [
          "pond"
      ]
  },
  {
      "_id": "0misXL7ZyVgIVUvs",
      "system.habitats": [
          "pond",
          "river",
          "riverside",
          "swamp"
      ]
  },
  {
      "_id": "AIZ87tKeU6zWsJqq",
      "system.habitats": [
          "pond",
          "lake",
          "river",
          "riverside"
      ]
  },
  {
      "_id": "5oPMlgw9dS3loAfh",
      "system.habitats": [
          "pond",
          "lake",
          "river",
          "riverside"
      ]
  },
  {
      "_id": "emlDgHLrL7Uf0SGi",
      "system.habitats": [
          "pond",
          "lake",
          "river",
          "riverside"
      ]
  },
  {
      "_id": "hFvAdNyUkEG5pVqP",
      "system.habitats": [
          "pond",
          "riverside",
          "swamp"
      ]
  },
  {
      "_id": "it1fgNoX9Mj7AO1w",
      "system.habitats": [
          "lake",
          "river",
          "riverside",
          "beach"
      ]
  },
  {
      "_id": "wLs36MjrFMgICzpA",
      "system.habitats": [
          "lake",
          "river",
          "ocean",
          "reef",
          "polar"
      ]
  },
  {
      "_id": "mFxnfFc4Zb9cgde9",
      "system.habitats": [
          "lake"
      ]
  },
  {
      "_id": "AnPos5YzUQNo8eFG",
      "system.habitats": [
          "lake"
      ]
  },
  {
      "_id": "1onk4LiKDe1Ne4s9",
      "system.habitats": [
          "lake",
          "ocean"
      ]
  },
  {
      "_id": "7cPNHVaVom6J7rAT",
      "system.habitats": [
          "lake",
          "river",
          "swamp"
      ]
  },
  {
      "_id": "egOvA7Kwx4hZdYnS",
      "system.habitats": [
          "lake",
          "river",
          "swamp"
      ]
  },
  {
      "_id": "IdeCj7OGKWQfNSwz",
      "system.habitats": [
          "lake",
          "river",
          "swamp"
      ]
  },
  {
      "_id": "6HyvBOqJ3hfbVojE",
      "system.habitats": [
          "lake",
          "river",
          "ocean",
          "reef"
      ]
  },
  {
      "_id": "70lWFjOs4Yjo30mo",
      "system.habitats": [
          "lake",
          "river",
          "ocean",
          "reef"
      ]
  },
  {
      "_id": "L6HOFG0jAzWiYjS6",
      "system.habitats": [
          "lake",
          "river",
          "ocean",
          "reef"
      ]
  },
  {
      "_id": "n4rOWeUY5S1goNzY",
      "system.habitats": [
          "lake",
          "river"
      ]
  },
  {
      "_id": "mjL23gskhobJAbXI",
      "system.habitats": [
          "lake"
      ]
  },
  {
      "_id": "pZymethnV5Mo3WWx",
      "system.habitats": [
          "lake",
          "riverside"
      ]
  },
  {
      "_id": "eHnrxOcOYFMopnD0",
      "system.habitats": [
          "river",
          "ocean",
          "reef"
      ]
  },
  {
      "_id": "JvpyjVfPcqvoEtVZ",
      "system.habitats": [
          "river",
          "ocean",
          "reef"
      ]
  },
  {
      "_id": "91Wv7G1j2kkCpGsI",
      "system.habitats": [
          "river",
          "riverside",
          "beach",
          "ocean"
      ]
  },
  {
      "_id": "ShZsjLKoUPP33d0T",
      "system.habitats": [
          "river",
          "riverside",
          "beach",
          "ocean"
      ]
  },
  {
      "_id": "bcSlJEdtzCsFZP2c",
      "system.habitats": [
          "river",
          "ocean",
          "reef",
          "abyss"
      ]
  },
  {
      "_id": "8XAJ8hjk0mC2AjsF",
      "system.habitats": [
          "riverside",
          "beach"
      ]
  },
  {
      "_id": "V0JLTpFpHzqHiom5",
      "system.habitats": [
          "riverside",
          "beach"
      ]
  },
  {
      "_id": "hVY20AdfvLPcJxz7",
      "system.habitats": [
          "riverside"
      ]
  },
  {
      "_id": "4kbbBdYGuE2kgBMQ",
      "system.habitats": [
          "riverside",
          "beach"
      ]
  },
  {
      "_id": "qL3bQmhiA4o4M1iQ",
      "system.habitats": [
          "riverside"
      ]
  },
  {
      "_id": "P0gr2ebwmYLdS32v",
      "system.habitats": [
          "riverside"
      ]
  },
  {
      "_id": "R54ZmNsHthnBa4xq",
      "system.habitats": [
          "riverside",
          "beach",
          "ice",
          "tundra"
      ]
  },
  {
      "_id": "y2QiocIQKl6EplCX",
      "system.habitats": [
          "beach"
      ]
  },
  {
      "_id": "n8tea86RqqKitthX",
      "system.habitats": [
          "beach"
      ]
  },
  {
      "_id": "ztrb3a2ayqZdyvyf",
      "system.habitats": [
          "beach",
          "swamp"
      ]
  },
  {
      "_id": "FTcFmORaZFbzzCiz",
      "system.habitats": [
          "beach",
          "swamp"
      ]
  },
  {
      "_id": "LiJCzfd69PjewYv1",
      "system.habitats": [
          "beach",
          "swamp"
      ]
  },
  {
      "_id": "wuUONeBe3bhWID3d",
      "system.habitats": [
          "beach",
          "ocean",
          "reef",
          "polar"
      ]
  },
  {
      "_id": "hz5fQIcWXM8cFFHz",
      "system.habitats": [
          "beach",
          "ocean",
          "reef",
          "polar"
      ]
  },
  {
      "_id": "22PxQD1Gh8l3BNM2",
      "system.habitats": [
          "beach",
          "ocean"
      ]
  },
  {
      "_id": "Qxxg1K8QcCA5bkBJ",
      "system.habitats": [
          "beach",
          "reef"
      ]
  },
  {
      "_id": "pwYyAjYBMD9wxy5V",
      "system.habitats": [
          "beach",
          "reef"
      ]
  },
  {
      "_id": "r8t3J1rYshJ6K3oI",
      "system.habitats": [
          "beach"
      ]
  },
  {
      "_id": "GLmbqDFnI4bJDpHI",
      "system.habitats": [
          "beach"
      ]
  },
  {
      "_id": "aOBs3pW6dFnoaqRE",
      "system.habitats": [
          "beach"
      ]
  },
  {
      "_id": "Ka9QR5URX4MiaC2I",
      "system.habitats": [
          "beach"
      ]
  },
  {
      "_id": "zrpO0mdbuA4C1wqW",
      "system.habitats": [
          "beach"
      ]
  },
  {
      "_id": "ufq1cK1NJc60YdoO",
      "system.habitats": [
          "beach"
      ]
  },
  {
      "_id": "gyL68VsYylfJjyjK",
      "system.habitats": [
          "beach"
      ]
  },
  {
      "_id": "TyYN3MFxK5KO6PWA",
      "system.habitats": [
          "beach"
      ]
  },
  {
      "_id": "TGgRTWpX9t8rYCrp",
      "system.habitats": [
          "beach"
      ]
  },
  {
      "_id": "gWO2o4myQ9NAlR4Y",
      "system.habitats": [
          "beach"
      ]
  },
  {
      "_id": "yP1fuAFMLapgmOzP",
      "system.habitats": [
          "beach",
          "ocean",
          "reef"
      ]
  },
  {
      "_id": "iXfdlpzeQYXpU8om",
      "system.habitats": [
          "beach",
          "ocean",
          "reef"
      ]
  },
  {
      "_id": "zz7MIakZXE5oIvcV",
      "system.habitats": [
          "beach",
          "abyss"
      ]
  },
  {
      "_id": "WtZyk8kxWo0cgxxf",
      "system.habitats": [
          "beach",
          "abyss"
      ]
  },
  {
      "_id": "TsTjeDCjUVWm44m0",
      "system.habitats": [
          "beach"
      ]
  },
  {
      "_id": "CqXWRDp4k0a4rEZJ",
      "system.habitats": [
          "beach"
      ]
  },
  {
      "_id": "FgJYsMf3bR0YESOj",
      "system.habitats": [
          "beach",
          "reef",
          "abyss"
      ]
  },
  {
      "_id": "J2OSFAP2IMeHyGc9",
      "system.habitats": [
          "beach",
          "ocean",
          "polar"
      ]
  },
  {
      "_id": "LD8QtEL6MQVLlEna",
      "system.habitats": [
          "beach",
          "ocean",
          "polar"
      ]
  },
  {
      "_id": "3j9XzmQO9k0YDkzV",
      "system.habitats": [
          "beach",
          "ocean",
          "polar"
      ]
  },
  {
      "_id": "wb0Ro2ZSYlKng0pT",
      "system.habitats": [
          "beach",
          "ocean",
          "reef",
          "polar",
          "abyss"
      ]
  },
  {
      "_id": "z8JH0baT49p4YYKX",
      "system.habitats": [
          "beach",
          "ocean",
          "polar"
      ]
  },
  {
      "_id": "EbertM3vA1cUlAZq",
      "system.habitats": [
          "beach",
          "ocean",
          "polar"
      ]
  },
  {
      "_id": "bEqIILd0ziEgbpeK",
      "system.habitats": [
          "beach",
          "reef"
      ]
  },
  {
      "_id": "VuMw5S2mld93qx7T",
      "system.habitats": [
          "beach",
          "reef"
      ]
  },
  {
      "_id": "iyuLhCJdCLqehu9n",
      "system.habitats": [
          "ocean",
          "reef",
          "polar"
      ]
  },
  {
      "_id": "NOC2ZHhRe6nSad2z",
      "system.habitats": [
          "ocean",
          "reef",
          "polar"
      ]
  },
  {
      "_id": "nsCmwEbgkeZWmA5r",
      "system.habitats": [
          "ocean",
          "reef",
          "polar"
      ]
  },
  {
      "_id": "nZdV4wNZB7cRlkGo",
      "system.habitats": [
          "ocean",
          "reef",
          "polar",
          "abyss"
      ]
  },
  {
      "_id": "VmZG4PJCPFtsD0Ke",
      "system.habitats": [
          "ocean",
          "reef"
      ]
  },
  {
      "_id": "G9SDmgh103jgZ93Y",
      "system.habitats": [
          "ocean",
          "reef"
      ]
  },
  {
      "_id": "pUa6KIDHSGQ7NvaA",
      "system.habitats": [
          "ocean",
          "reef"
      ]
  },
  {
      "_id": "hWhbKY2pduvsxjvy",
      "system.habitats": [
          "ocean",
          "reef",
          "polar"
      ]
  },
  {
      "_id": "d09CR5eUziDgKp7l",
      "system.habitats": [
          "ocean",
          "reef",
          "abyss"
      ]
  },
  {
      "_id": "MlNvt2TceuXrFJYj",
      "system.habitats": [
          "ocean",
          "reef",
          "abyss"
      ]
  },
  {
      "_id": "zCNCrrbTcYl1n9tZ",
      "system.habitats": [
          "ocean",
          "reef",
          "polar",
          "abyss"
      ]
  },
  {
      "_id": "b0R9DIFOgR9fDcLP",
      "system.habitats": [
          "ocean",
          "reef"
      ]
  },
  {
      "_id": "ph6Gxb3bUi8Yh711",
      "system.habitats": [
          "ocean",
          "reef"
      ]
  },
  {
      "_id": "mwSqbGDLIDMnutkE",
      "system.habitats": [
          "ocean",
          "reef",
          "abyss"
      ]
  },
  {
      "_id": "s6TsoitJ7X3A0ZXF",
      "system.habitats": [
          "ocean",
          "reef"
      ]
  },
  {
      "_id": "QKgn5RYZ29UjdQaK",
      "system.habitats": [
          "ocean"
      ]
  },
  {
      "_id": "2wumLQ2NYg5Ap45z",
      "system.habitats": [
          "ocean",
          "reef",
          "abyss"
      ]
  },
  {
      "_id": "1S3QiEuezM4nWTim",
      "system.habitats": [
          "ocean",
          "reef"
      ]
  },
  {
      "_id": "Bk2DUAM3I8qmKrzD",
      "system.habitats": [
          "ocean",
          "reef"
      ]
  },
  {
      "_id": "TFdYvRVrA5YOUdb7",
      "system.habitats": [
          "ocean",
          "reef",
          "polar",
          "abyss"
      ]
  },
  {
      "_id": "LbBqSSNRHiBcBrtY",
      "system.habitats": [
          "ocean",
          "reef",
          "polar",
          "abyss"
      ]
  },
  {
      "_id": "Ya4Ew7O0mjs1sQvd",
      "system.habitats": [
          "ocean",
          "reef"
      ]
  },
  {
      "_id": "6jQVELtlMScB1IUV",
      "system.habitats": [
          "ocean",
          "abyss"
      ]
  },
  {
      "_id": "8S67J49mDNthLbnT",
      "system.habitats": [
          "ocean",
          "abyss"
      ]
  },
  {
      "_id": "gYpB0zbryRfOQaXz",
      "system.habitats": [
          "ocean",
          "reef"
      ]
  },
  {
      "_id": "Oi3phRXvlfLXq9r1",
      "system.habitats": [
          "ocean",
          "reef"
      ]
  },
  {
      "_id": "BO5n9bW4Nf8brmR4",
      "system.habitats": [
          "ocean",
          "reef",
          "polar"
      ]
  },
  {
      "_id": "YzecIXhSMmCK76GG",
      "system.habitats": [
          "ocean",
          "abyss"
      ]
  },
  {
      "_id": "mG7E8BxuMutM8Kpv",
      "system.habitats": [
          "ocean",
          "polar",
          "abyss"
      ]
  },
  {
      "_id": "MYptb932OldurRgQ",
      "system.habitats": [
          "ocean",
          "reef"
      ]
  },
  {
      "_id": "BGeMaUNS1woiZWfG",
      "system.habitats": [
          "ocean",
          "reef"
      ]
  },
  {
      "_id": "HkkwVke4dYJNdqPW",
      "system.habitats": [
          "ocean",
          "reef",
          "polar",
          "abyss"
      ]
  },
  {
      "_id": "XUU0TJWRPW6fj35h",
      "system.habitats": [
          "reef",
          "polar"
      ]
  },
  {
      "_id": "THhQI9ecKnBtCMI4",
      "system.habitats": [
          "reef",
          "abyss"
      ]
  },
  {
      "_id": "AUBorPCqqbXV0F6l",
      "system.habitats": [
          "reef"
      ]
  },
  {
      "_id": "i85LJsDp0LYo1p0q",
      "system.habitats": [
          "reef"
      ]
  },
  {
      "_id": "r1Wx1TKSqaI2tOBk",
      "system.habitats": [
          "polar"
      ]
  },
  {
      "_id": "3zrGkUyxppEWugpS",
      "system.habitats": [
          "polar"
      ]
  },
  {
      "_id": "vxXWQhzIUA2KWfTk",
      "system.habitats": [
          "polar",
          "ice"
      ]
  },
  {
      "_id": "DmG1sxx5YuXh77rZ",
      "system.habitats": [
          "polar",
          "ice"
      ]
  },
  {
      "_id": "h6eIEjNSv39eKDJw",
      "system.habitats": [
          "polar",
          "ice"
      ]
  },
  {
      "_id": "rwztuFZeHsGOVitA",
      "system.habitats": [
          "polar"
      ]
  },
  {
      "_id": "NKL0TccBgqsxDiKn",
      "system.habitats": [
          "polar"
      ]
  },
  {
      "_id": "qiDoQPGEQqgqGLGS",
      "system.habitats": [
          "polar"
      ]
  },
  {
      "_id": "4qXHvFzagzFWQPbz",
      "system.habitats": [
          "polar",
          "ice",
          "tundra"
      ]
  },
  {
      "_id": "UaCZJ5g9yIoLBpcE",
      "system.habitats": [
          "polar",
          "ice"
      ]
  },
  {
      "_id": "RlL2nAenISOBsewY",
      "system.habitats": [
          "polar"
      ]
  },
  {
      "_id": "3ZgIUXJDSbDqf9Ec",
      "system.habitats": [
          "abyss"
      ]
  },
  {
      "_id": "8UOxV0dUEyAgwBw9",
      "system.habitats": [
          "abyss"
      ]
  },
  {
      "_id": "iBAHkDt4x1sCvpFH",
      "system.habitats": [
          "abyss"
      ]
  },
  {
      "_id": "cqMcNo7T2max1pgD",
      "system.habitats": [
          "swamp"
      ]
  },
  {
      "_id": "vKhova6g3bV7yJBo",
      "system.habitats": [
          "swamp"
      ]
  },
  {
      "_id": "ch9abdxnjppXGWjH",
      "system.habitats": [
          "swamp"
      ]
  },
  {
      "_id": "3xSuDKZXchqrwt67",
      "system.habitats": [
          "swamp"
      ]
  },
  {
      "_id": "AJIa9EWiT6g1Swba",
      "system.habitats": [
          "swamp"
      ]
  },
  {
      "_id": "TilHLGKOpNOtYolO",
      "system.habitats": [
          "swamp",
          "tundra"
      ]
  },
  {
      "_id": "p1wtIAhJvqw9VAnD",
      "system.habitats": [
          "swamp"
      ]
  },
  {
      "_id": "fBBsFPTbxTYp3t5e",
      "system.habitats": [
          "ice"
      ]
  },
  {
      "_id": "VMWAuATdSSR1rX6N",
      "system.habitats": [
          "ice",
          "tundra"
      ]
  },
  {
      "_id": "wyJrbxnfjJIUpFeP",
      "system.habitats": [
          "ice",
          "tundra"
      ]
  },
  {
      "_id": "cbcrj0gHNVGWZaYX",
      "system.habitats": [
          "ice",
          "tundra"
      ]
  },
  {
      "_id": "pIfbrD0AHHqtYz9a",
      "system.habitats": [
          "ice"
      ]
  },
  {
      "_id": "6uZrqciwHf4fADYG",
      "system.habitats": [
          "ice"
      ]
  },
  {
      "_id": "EEePfa19gzhFZ0OT",
      "system.habitats": [
          "ice"
      ]
  },
  {
      "_id": "CeEVuKuHLBOHX7na",
      "system.habitats": [
          "ice",
          "tundra"
      ]
  },
  {
      "_id": "HEuxnkSCMLpI2KNA",
      "system.habitats": [
          "ice",
          "tundra"
      ]
  },
  {
      "_id": "fRXs2m8WUwcCKeiE",
      "system.habitats": [
          "ice",
          "tundra"
      ]
  },
  {
      "_id": "t6PwxXiIe85TOJjZ",
      "system.habitats": [
          "ice",
          "tundra"
      ]
  },
  {
      "_id": "SpOkufx11bHYeFUV",
      "system.habitats": [
          "ice",
          "tundra"
      ]
  },
  {
      "_id": "4RzfeE6zqAQkfwZT",
      "system.habitats": [
          "ice"
      ]
  },
  {
      "_id": "o9I5950HtNzNR1uS",
      "system.habitats": [
          "ice"
      ]
  },
  {
      "_id": "xn7w3ci59QWMwpzJ",
      "system.habitats": [
          "ice"
      ]
  },
  {
      "_id": "lGjCtKAxbsjhfEZZ",
      "system.habitats": [
          "ice"
      ]
  },
  {
      "_id": "fwjKEy3F1bdvhdwS",
      "system.habitats": [
          "ice",
          "tundra"
      ]
  },
  {
      "_id": "8KYUvekVIs8TyWee",
      "system.habitats": [
          "ice"
      ]
  },
  {
      "_id": "4qSoD6IQqOV0iOqd",
      "system.habitats": [
          "ice"
      ]
  },
  {
      "_id": "H4aGcVk0t89qyUS4",
      "system.habitats": [
          "ice",
          "tundra"
      ]
  },
  {
      "_id": "0976TRN63XfSPMwg",
      "system.habitats": [
          "ice",
          "tundra"
      ]
  },
  {
      "_id": "Q9bQNZHaEqfhZZsy",
      "system.habitats": [
          "ice"
      ]
  },
  {
      "_id": "0XGIYew2WoqJMp2f",
      "system.habitats": [
          "ice"
      ]
  },
  {
      "_id": "WELsaunxPKQXt4T7",
      "system.habitats": [
          "ice",
          "tundra"
      ]
  },
  {
      "_id": "90rvcDOyrhSpyYVL",
      "system.habitats": [
          "ice",
          "tundra"
      ]
  },
  {
      "_id": "lGxBGj1JZ0INf8Jv",
      "system.habitats": [
          "ice",
          "tundra"
      ]
  },
  {
      "_id": "xLNQQNY9sPyryF47",
      "system.habitats": [
          "ruin"
      ]
  },
  {
      "_id": "qS8HIcJmB9hgTtFl",
      "system.habitats": [
          "ruin"
      ]
  },
  {
      "_id": "zdGXROiBf2gRK6HJ",
      "system.habitats": [
          "ruin"
      ]
  },
  {
      "_id": "M8JgpiPC2zDc4Uzl",
      "system.habitats": [
          "ruin"
      ]
  },
  {
      "_id": "Tm71a7aC5dRkM8gJ",
      "system.habitats": [
          "ruin"
      ]
  },
  {
      "_id": "GZZoc4tDvS5c2UGE",
      "system.habitats": [
          "ruin"
      ]
  },
  {
      "_id": "4Zy0phwHb9YmRk7n",
      "system.habitats": [
          "ruin"
      ]
  },
  {
      "_id": "4ZNE2i7uXv648XWm",
      "system.habitats": [
          "ruin"
      ]
  },
  {
      "_id": "fucFFBzH5UFg4evU",
      "system.habitats": [
          "ruin"
      ]
  },
  {
      "_id": "PuZ4HZcsrhpbeVZ1",
      "system.habitats": [
          "ruin"
      ]
  },
  {
      "_id": "Wy8BEhJPMcSCgdBT",
      "system.habitats": [
          "ruin"
      ]
  },
  {
      "_id": "tPERYPJLMNt5aub6",
      "system.habitats": [
          "ruin"
      ]
  },
  {
      "_id": "y4FNsu3YnTNWRILL",
      "system.habitats": [
          "ruin"
      ]
  },
  {
      "_id": "JPS7YzHXVVQaHta6",
      "system.habitats": [
          "ruin"
      ]
  },
  {
      "_id": "3LWkQftUzvnqxNtg",
      "system.habitats": [
          "ruin"
      ]
  },
  {
      "_id": "fIQ07e3w2gbpejZZ",
      "system.habitats": [
          "ruin"
      ]
  },
  {
      "_id": "SY8K2Qxp57iYbltk",
      "system.habitats": [
          "ruin"
      ]
  }
]

const speciesMap = new Map(data.map(data => [data._id, data]));

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const packsDataPath = path.resolve(__dirname, "../../packs/core-species");

for(const file of fs.readdirSync(packsDataPath)) {
  if(file.startsWith("_")) continue;
  const filePath = path.resolve(packsDataPath, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if(!data.system) throw new Error(`Missing system data in ${filePath}`);
  const speciesData = speciesMap.get(data._id);
  if(!speciesData) continue;

  data.system.habitats = speciesData["system.habitats"];

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}