package com.example.sparkling.storagequickstart

data class SparklingAutolinkModule(
    val name: String,
    val androidPackage: String?,
    val className: String?,
    val methodClassNames: List<String> = emptyList(),
)

object SparklingAutolink {
    val modules =
        listOf(
            SparklingAutolinkModule(
                name = "sparkling-navigation",
                androidPackage = "com.tiktok.sparkling.method.router",
                className = "RouterMethod",
                methodClassNames =
                    listOf(
                        "com.tiktok.sparkling.method.router.open.RouterOpenMethod",
                        "com.tiktok.sparkling.method.router.close.RouterCloseMethod",
                    ),
            ),
            SparklingAutolinkModule(
                name = "sparkling-storage",
                androidPackage = "com.tiktok.sparkling.method.storage",
                className = "StorageMethod",
                methodClassNames =
                    listOf(
                        "com.tiktok.sparkling.method.storage.getItem.StorageGetItemMethod",
                        "com.tiktok.sparkling.method.storage.setItem.StorageSetItemMethod",
                        "com.tiktok.sparkling.method.storage.removeItem.StorageRemoveItemMethod",
                    ),
            ),
        )
}
